function loadImageData() {
    return fetch('../../db/moe_pictures.json') // Database of image data
        .then(response => response.json())
        .then(data => {
            imageData = data;
        })
        .catch(error => console.error('Error loading image data:', error));
}

function loadImages() {
    // Show loading text
    const loadingText = document.querySelector('.loading_text');
    if (loadingText) {
        loadingText.textContent = 'Loading...'; // Set text to "Loading..."
    }

    const imagePromises = [];
    for (let i = 1; i <= totalImages; i++) {
        const img = new Image();
        img.src = `../images/moe/image${i}.png`; //path to edit
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

        // Do not hide loading text here
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

    // Hide loading text after images are displayed
    const loadingText = document.querySelector('.loading_text');
    if (loadingText) {
        loadingText.textContent = ''; // Clear text
    }
}
