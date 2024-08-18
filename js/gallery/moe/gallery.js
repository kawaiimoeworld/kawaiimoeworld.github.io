document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const overlay = document.getElementById('overlay');
    const enlargedImage = document.getElementById('enlarged-image');
    const imageAuthor = document.getElementById('image-author');
    const imageDescription = document.getElementById('image-description');
    const totalImages = 13; // Image number to update
    const targetRowHeight = 200;
    let imageData = {};

    function loadImageData() {
        return fetch('../../db/moe_pictures.json') // Database of image data
            .then(response => response.json())
            .then(data => {
                imageData = data;
            })
            .catch(error => console.error('Error loading image data:', error));
    }

    function loadImages() {
        const imagePromises = [];
        for (let i = 1; i <= totalImages; i++) {
            const img = new Image();
            img.src = `../images/moe${i}.png`; //path to edit
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = () => reject(`Failed to load image${i}.png`);
            });
            imagePromises.push(promise);
        }

        Promise.allSettled(imagePromises).then(results => {
            const loadedImages = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            displayImages(loadedImages);
        });
    }

    function displayImages(images) {
        gallery.innerHTML = '';
        let row = [];
        let rowWidth = 0;
        const containerWidth = gallery.clientWidth;

        images.forEach((img, index) => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const scaledWidth = targetRowHeight * aspectRatio;
            
            if (rowWidth + scaledWidth > containerWidth) {
                applyRowLayout(row, containerWidth);
                row = [];
                rowWidth = 0;
            }

            row.push({ img, aspectRatio, scaledWidth });
            rowWidth += scaledWidth;

            if (index === images.length - 1) {
                applyRowLayout(row, containerWidth);
            }
        });
    }

    function applyRowLayout(row, containerWidth) {
        const totalAspectRatio = row.reduce((sum, item) => sum + item.aspectRatio, 0);
        const rowHeight = containerWidth / totalAspectRatio;

        row.forEach(({ img, aspectRatio }) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            const width = rowHeight * aspectRatio;
            item.style.width = `${width}px`;
            item.style.height = `${rowHeight}px`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            item.appendChild(img);
            gallery.appendChild(item);
        });
    }

    function enlargeImage(e) {
        if (e.target.tagName === 'IMG') {
            const imageName = e.target.src.split('/').pop();
            enlargedImage.src = e.target.src;
            
            if (imageData[imageName]) {
                imageAuthor.textContent = imageData[imageName].author;
                imageDescription.textContent = imageData[imageName].description;
            } else {
                imageAuthor.textContent = 'Unknown Author';
                imageDescription.textContent = 'No description available';
            }

            overlay.style.display = 'flex';
        }
    }

    function closeEnlargedImage() {
        overlay.style.display = 'none';
    }

    loadImageData().then(() => {
        loadImages();
        window.addEventListener('resize', () => {
            const images = Array.from(document.querySelectorAll('.gallery-item img'));
            displayImages(images);
        });
        gallery.addEventListener('click', enlargeImage);
        overlay.addEventListener('click', closeEnlargedImage);
    });
});