import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import base64

class TemporalService:
    def align_images_ultra(self, img1, img2):
        """
        Robust alignment using ECC with ORB fallback.
        """
        g1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        g2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

        # 1. Attempt ECC (High Precision)
        warp_matrix = np.eye(3, 3, dtype=np.float32)
        criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 50, 1e-6)
        try:
            _, warp_matrix = cv2.findTransformECC(
                g1, g2, warp_matrix,
                cv2.MOTION_HOMOGRAPHY,
                criteria
            )
            aligned = cv2.warpPerspective(
                img2, warp_matrix,
                (img1.shape[1], img1.shape[0]),
                flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP
            )
            return aligned
        except:
            # 2. Fallback to Feature-based alignment (ORB)
            orb = cv2.ORB_create(1000)
            kp1, des1 = orb.detectAndCompute(g1, None)
            kp2, des2 = orb.detectAndCompute(g2, None)
            
            if des1 is None or des2 is None:
                return img2

            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            matches = sorted(matches, key=lambda x: x.distance)
            
            if len(matches) < 4:
                return img2

            src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
            
            M, mask = cv2.findHomography(dst_pts, src_pts, cv2.RANSAC, 5.0)
            if M is None:
                return img2
                
            aligned = cv2.warpPerspective(img2, M, (img1.shape[1], img1.shape[0]))
            return aligned

    def normalize_lighting(self, img):
        """
        Normalizes illumination using CLAHE.
        """
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)

    def extract_leaf_roi(self, img):
        """
        Creates a mask focused on the leaf, handling white background.
        """
        # Grayscale thresholding for white backgrounds
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        
        # Color based confirmation (Green/Yellow)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lower = np.array([10, 20, 20])
        upper = np.array([110, 255, 255])
        color_mask = cv2.inRange(hsv, lower, upper)
        
        # Combine
        mask = cv2.bitwise_and(thresh, color_mask)
        kernel = np.ones((7, 7), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        return mask

    def extract_pathology_mask(self, img):
        """
        Isolates diseased/pathology spots (brown/yellow/necrotic).
        """
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Brown/Yellow necrotic spots range
        lower_necrotic = np.array([10, 50, 20])
        upper_necrotic = np.array([30, 255, 200])
        mask = cv2.inRange(hsv, lower_necrotic, upper_necrotic)
        
        # Refine mask
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        return mask

    def analyze_temporal_ultra(self, img1_bytes: bytes, img2_bytes: bytes):
        """
        Main entry point for robust temporal analysis with direction detection.
        """
        n1 = np.frombuffer(img1_bytes, np.uint8)
        img1 = cv2.imdecode(n1, cv2.IMREAD_COLOR)
        n2 = np.frombuffer(img2_bytes, np.uint8)
        img2 = cv2.imdecode(n2, cv2.IMREAD_COLOR)

        if img1 is None or img2 is None:
            return None, 0.0, "error"

        # 1. Normalize
        img1_n = self.normalize_lighting(img1)
        img2_n = self.normalize_lighting(img2)

        # 2. Align
        img2_a = self.align_images_ultra(img1_n, img2_n)

        # 3. ROI Extraction
        m1 = self.extract_leaf_roi(img1_n)
        m2 = self.extract_leaf_roi(img2_a)
        combined_roi = cv2.bitwise_and(m1, m2)
        
        leaf_area = cv2.countNonZero(combined_roi)
        if leaf_area < 100:
            return None, 0.0, "no_leaf_detected"

        # 4. Pathology Density Comparison (Directional Logic)
        p1 = self.extract_pathology_mask(img1_n)
        p2 = self.extract_pathology_mask(img2_a)
        
        # Only consider pathology within the combined ROI
        p1 = cv2.bitwise_and(p1, combined_roi)
        p2 = cv2.bitwise_and(p2, combined_roi)
        
        area1 = cv2.countNonZero(p1)
        area2 = cv2.countNonZero(p2)
        
        # 5. Differential Identification
        # Use absdiff for the visualization map
        diff_gray = cv2.absdiff(p1, p2)
        
        # Calculate raw delta
        delta_area = area2 - area1
        
        # Small noise threshold (0.05% of leaf area) to prevent jitter
        threshold = leaf_area * 0.0005
        
        if delta_area < -threshold:
            status = "recovery"
        elif delta_area > threshold:
            status = "progression"
        else:
            # If both are very small or identical, it's stable
            status = "stable" if (area1 > threshold or area2 > threshold) else "healthy_stable"

        if status == "recovery":
            # RECOVERY INDEX: What percentage of the baseline infection is gone?
            # This is more intuitive for users (e.g. "100% Recovered")
            score = (abs(delta_area) / area1 * 100) if area1 > 0 else 0
        else:
            # PROGRESSION INDEX: Global increase in leaf severity
            score = (abs(delta_area) / leaf_area * 100)
            
        score = min(max(score, 0.0), 100.0)

        # 6. Visualization (High contrast delta map)
        # We highlight exactly where the change happened
        heatmap = cv2.applyColorMap(cv2.convertScaleAbs(diff_gray, alpha=255.0), cv2.COLORMAP_JET)
        heatmap = cv2.bitwise_and(heatmap, heatmap, mask=diff_gray)
        
        _, buffer = cv2.imencode('.png', heatmap)
        base64_str = base64.b64encode(buffer).decode('utf-8')

        return base64_str, round(float(score), 2), status

temporal_service = TemporalService()
