class Confetti {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布样式
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        
        // 调整画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.particles = [];
        this.isAnimating = false;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        return {
            x,
            y,
            // 随机初始速度
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 3,
            // 随机大小
            size: Math.random() * 15 + 5,
            // 随机透明度
            alpha: 1,
            // 随机旋转
            rotation: Math.random() * 360,
            // 随机角速度
            rotationSpeed: (Math.random() - 0.5) * 2,
            // 随机形状（云朵或圆形）
            type: Math.random() > 0.5 ? 'cloud' : 'circle',
            // 随机颜色
            color: `hsla(${Math.random() * 60 + 180}, 70%, 85%, 0.8)`
        };
    }

    drawCloud(ctx, x, y, size, rotation, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.beginPath();
        
        // 绘制云朵形状
        ctx.moveTo(-size/2, 0);
        ctx.bezierCurveTo(
            -size/4, -size/2,
            size/4, -size/2,
            size/2, 0
        );
        ctx.bezierCurveTo(
            size/2 + size/4, size/3,
            -size/2 - size/4, size/3,
            -size/2, 0
        );
        
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            
            if (particle.type === 'cloud') {
                this.drawCloud(
                    this.ctx,
                    particle.x,
                    particle.y,
                    particle.size,
                    particle.rotation,
                    particle.color
                );
            } else {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size/2, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // 重力
            particle.rotation += particle.rotationSpeed;
            particle.alpha -= 0.01;
            
            // 如果粒子透明度过低则移除
            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 如果没有粒子了，停止动画
        if (this.particles.length === 0) {
            this.stop();
        }
    }

    animate() {
        if (!this.isAnimating) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    start(x, y) {
        // 如果画布还没添加到文档中，添加它
        if (!document.body.contains(this.canvas)) {
            document.body.appendChild(this.canvas);
        }
        
        // 创建粒子
        for (let i = 0; i < 30; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        
        // 开始动画
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }

    stop() {
        this.isAnimating = false;
        if (document.body.contains(this.canvas)) {
            document.body.removeChild(this.canvas);
        }
        this.particles = [];
    }
} 