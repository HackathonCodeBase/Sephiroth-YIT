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

    def analyze_temporal_ultra(self, img1_bytes: bytes, img2_bytes: bytes):
        """
        Main entry point for robust temporal analysis.
        """
        n1 = np.frombuffer(img1_bytes, np.uint8)
        img1 = cv2.imdecode(n1, cv2.IMREAD_COLOR)
        n2 = np.frombuffer(img2_bytes, np.uint8)
        img2 = cv2.imdecode(n2, cv2.IMREAD_COLOR)

        if img1 is None or img2 is None:
            return None, 0.0

        # 1. Normalize
        img1_n = self.normalize_lighting(img1)
        img2_n = self.normalize_lighting(img2)

        # 2. Align
        img2_a = self.align_images_ultra(img1_n, img2_n)

        # 3. ROI
        m1 = self.extract_leaf_roi(img1_n)
        m2 = self.extract_leaf_roi(img2_a)
        
        # Combine masks to find valid leaf area in both
        combined_roi = cv2.bitwise_and(m1, m2)

        # 4. Change Detection (Absolute Difference)
        diff = cv2.absdiff(img1_n, img2_a)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        
        # Apply ROI
        diff_masked = cv2.bitwise_and(diff_gray, diff_gray, mask=combined_roi)

        # 5. Threshold significant changes (Spots vs noise)
        # Lowered threshold to detect subtle brown spots in demo images
        _, thresh = cv2.threshold(diff_masked, 20, 255, cv2.THRESH_BINARY)
        
        # 6. Scoring
        leaf_area = cv2.countNonZero(combined_roi)
        infected_diff = cv2.countNonZero(thresh)
        
        if leaf_area < 100: # Threshold too small to be a leaf
            return None, 0.0
            
        score = (infected_diff / leaf_area) * 100
        score = min(max(score, 0.0), 100.0)

        # 7. Visualization (High contrast delta map)
        # Enhance the heatmap for better demo visibility
        heatmap = cv2.applyColorMap(cv2.convertScaleAbs(diff_masked, alpha=2.5), cv2.COLORMAP_JET)
        heatmap = cv2.bitwise_and(heatmap, heatmap, mask=thresh)
        
        _, buffer = cv2.imencode('.png', heatmap)
        base64_str = base64.b64encode(buffer).decode('utf-8')

        return base64_str, score

temporal_service = TemporalService()

temporal_service = TemporalService()
