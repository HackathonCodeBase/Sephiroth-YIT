#!/bin/bash

# Configuration
HF_TOKEN="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"
RESNET_URL="https://huggingface.co/DurgeshAP/AgroCare_ResNet/resolve/main/final_resnet_crop_model.h5"
EFFNET_URL="https://huggingface.co/DurgeshAP/AgroCare_EffNet/resolve/main/final_effienet_crop_model.h5"

echo "=== Testing ResNet Model Download ==="
curl -L -H "Authorization: Bearer $HF_TOKEN" "$RESNET_URL" -o test_resnet.h5
echo "File Size:" $(ls -lh test_resnet.h5)
echo "First 100 bytes (checking for LFS pointer or HDF5 signature):"
head -c 100 test_resnet.h5 | cat -v
echo -e "\n"

echo "=== Testing EfficientNet Model Download ==="
curl -L -H "Authorization: Bearer $HF_TOKEN" "$EFFNET_URL" -o test_effnet.h5
echo "File Size:" $(ls -lh test_effnet.h5)
echo "First 100 bytes (checking for LFS pointer or HDF5 signature):"
head -c 100 test_effnet.h5 | cat -v
echo -e "\n"

echo "=== DIAGNOSIS ==="
echo "If size is around 800 bytes, the H5 file is likely an empty HDF5 shell or a broken upload."
echo "If size is in MBs, the download is successful."
