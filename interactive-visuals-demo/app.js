// Interactive Visuals Demo - Drawing App
class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentShape = 'circle';
        this.currentColor = '#3498db';
        this.currentSize = 30;
        
        this.initializeControls();
        this.initializeCanvas();
        this.setupEventListeners();
    }
    
    initializeControls() {
        this.shapeSelect = document.getElementById('shapeSelect');
        this.colorPicker = document.getElementById('colorPicker');
        this.sizeSlider = document.getElementById('sizeSlider');
        this.sizeValue = document.getElementById('sizeValue');
        this.clearButton = document.getElementById('clearCanvas');
    }
    
    initializeCanvas() {
        // Set canvas background to white
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set initial drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    setupEventListeners() {
        // Control event listeners
        this.shapeSelect.addEventListener('change', (e) => {
            this.currentShape = e.target.value;
        });
        
        this.colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
        });
        
        this.sizeSlider.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            this.sizeValue.textContent = this.currentSize;
        });
        
        this.clearButton.addEventListener('click', () => {
            this.clearCanvas();
        });
        
        // Canvas drawing event listeners
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch event listeners for mobile support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.drawShape(pos.x, pos.y);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        this.drawShape(pos.x, pos.y);
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    drawShape(x, y) {
        this.ctx.fillStyle = this.currentColor;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = 2;
        
        if (this.currentShape === 'circle') {
            this.drawCircle(x, y);
        } else if (this.currentShape === 'square') {
            this.drawSquare(x, y);
        }
    }
    
    drawCircle(x, y) {
        const radius = this.currentSize / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    drawSquare(x, y) {
        const size = this.currentSize;
        const halfSize = size / 2;
        
        this.ctx.fillRect(x - halfSize, y - halfSize, size, size);
        this.ctx.strokeRect(x - halfSize, y - halfSize, size, size);
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset background to white
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add a subtle animation effect
        this.canvas.style.opacity = '0.5';
        setTimeout(() => {
            this.canvas.style.opacity = '1';
        }, 150);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
    
    // Add some visual feedback for the page load
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.6s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
});

// Add some utility functions for enhanced user experience
function showTooltip(element, message) {
    // Simple tooltip functionality
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.bottom + 5 + 'px';
    
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }, 2000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'c':
                e.preventDefault();
                document.getElementById('clearCanvas').click();
                showTooltip(document.getElementById('clearCanvas'), 'Canvas cleared!');
                break;
            case '1':
                e.preventDefault();
                document.getElementById('shapeSelect').value = 'circle';
                document.getElementById('shapeSelect').dispatchEvent(new Event('change'));
                showTooltip(document.getElementById('shapeSelect'), 'Circle selected!');
                break;
            case '2':
                e.preventDefault();
                document.getElementById('shapeSelect').value = 'square';
                document.getElementById('shapeSelect').dispatchEvent(new Event('change'));
                showTooltip(document.getElementById('shapeSelect'), 'Square selected!');
                break;
        }
    }
});