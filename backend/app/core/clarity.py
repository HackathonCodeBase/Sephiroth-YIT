import cv2
import numpy as np

class ClarityValidator:
    @staticmethod
    def validate(image_bytes: bytes, laplacian_threshold: float = 10.0) -> tuple[bool, str | None]:
        """
        Uses Laplacian variance for sharpness and mean for brightness.
        Returns (is_invalid, error_message).
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            # Decode to grayscale
            img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
            
            if img is None:
                return True, "Invalid image format."
            
            # Optimization: Resize for faster calculation if image is large
            h, w = img.shape
            if max(h, w) > 600:
                scale = 600 / max(h, w)
                img = cv2.resize(img, (int(w * scale), int(h * scale)))
            
            # 1. Laplacian variance (Sharpness)
            variance = cv2.Laplacian(img, cv2.CV_64F).var()
            
            # 2. Average Brightness
            brightness = np.mean(img)
            
            print(f"Backend Clarity Check - Variance: {variance:.2f}, Brightness: {brightness:.2f}")
            
            if variance < laplacian_threshold:
                return True, f"Analysis focus failed. Sharpness variance [{variance:.1f}] is below diagnostic threshold [{laplacian_threshold:.1f}]."
            
            if brightness < 35:
                # Still keep a loose brightness check to prevent pure black images
                return True, f"Luminance [{brightness:.1f}] is insufficient for pathology analysis."
            
            return False, None
            
        except Exception as e:
            print(f"Error during clarity validation: {e}")
            return False, None # Fallback

clarity_validator = ClarityValidator()
