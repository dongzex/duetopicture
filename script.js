document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const compressionSection = document.querySelector('.compression-section');
    const enhanceToggle = document.getElementById('enhance');
    const enhanceOptions = document.querySelector('.enhance-options');
    const sharpnessSlider = document.getElementById('sharpness');
    const sharpnessValue = document.getElementById('sharpnessValue');

    let originalImage = null;

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#DEDEDE';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#DEDEDE';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });

    // 文件选择处理
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            handleImageUpload(file);
        } else {
            alert('请选择 PNG 或 JPG 格式的图片');
        }
    });

    // 质量滑块变化事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        if (originalImage) {
            compressImage(originalImage, e.target.value / 100);
        }
    });

    enhanceToggle.addEventListener('change', (e) => {
        enhanceOptions.style.display = e.target.checked ? 'block' : 'none';
        if (originalImage) {
            compressImage(originalImage, qualitySlider.value / 100);
        }
    });

    sharpnessSlider.addEventListener('input', (e) => {
        sharpnessValue.textContent = `${e.target.value}%`;
        if (originalImage) {
            compressImage(originalImage, qualitySlider.value / 100);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB 限制
            alert('图片大小不能超过 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = () => {
                originalPreview.src = e.target.result;
                originalSize.textContent = `文件大小: ${formatFileSize(file.size)}`;
                compressImage(originalImage, qualitySlider.value / 100);
                compressionSection.style.display = 'block';
            };
            originalImage.onerror = () => {
                alert('图片加载失败，请重试');
            };
        };
        reader.onerror = () => {
            alert('图片读取失败，请重试');
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(image, quality) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;

        // 绘制原始图像
        ctx.drawImage(image, 0, 0);

        // 如果启用了画质增强
        if (enhanceToggle.checked) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const sharpness = sharpnessSlider.value / 100;

            // 应用锐化效果
            for (let i = 0; i < data.length; i += 4) {
                if (i % (canvas.width * 4) === 0 || i < canvas.width * 4 || i > data.length - canvas.width * 4) continue;

                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const tr = data[i - 4] + data[i + 4];
                const tg = data[i - 3] + data[i + 5];
                const tb = data[i - 2] + data[i + 6];

                data[i] = r + (r - tr / 2) * sharpness;
                data[i + 1] = g + (g - tg / 2) * sharpness;
                data[i + 2] = b + (b - tb / 2) * sharpness;
            }

            ctx.putImageData(imageData, 0, 0);
        }

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        compressedPreview.src = compressedDataUrl;

        const compressedSize = Math.round((compressedDataUrl.length - 'data:image/jpeg;base64,'.length) * 3/4);
        document.getElementById('compressedSize').textContent = `文件大小: ${formatFileSize(compressedSize)}`;

        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = 'optimized-image.jpg';
            link.href = compressedDataUrl;
            link.click();
        };
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 