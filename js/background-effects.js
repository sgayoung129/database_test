// 동적 배경 효과
class BackgroundEffect {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        
        this.init();
        this.createParticles();
        this.animate();
        
        // 리사이즈 이벤트 처리
        window.addEventListener('resize', () => this.handleResize());
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 200 // 파란색-보라색 범위
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 그라데이션 배경 생성
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
        gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.6)');
        gradient.addColorStop(1, 'rgba(64, 224, 208, 0.4)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 파티클 업데이트 및 그리기
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // 파티클 이동
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // 경계 체크
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            // 파티클 그리기
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
            this.ctx.fill();
            
            // 연결선 그리기
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle2 = this.particles[j];
                const distance = Math.sqrt(
                    Math.pow(particle.x - particle2.x, 2) + 
                    Math.pow(particle.y - particle2.y, 2)
                );
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(particle2.x, particle2.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// 마우스 상호작용 효과
class MouseEffect {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mouse = { x: 0, y: 0 };
        this.ripples = [];
        
        this.bindEvents();
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('click', (e) => {
            this.createRipple(e.clientX, e.clientY);
        });
    }
    
    createRipple(x, y) {
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 150,
            opacity: 0.3,
            speed: 3
        });
    }
    
    updateRipples() {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];
            ripple.radius += ripple.speed;
            ripple.opacity -= 0.005;
            
            if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
                this.ripples.splice(i, 1);
                continue;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 메인 페이지에서만 실행
    if (document.getElementById('backgroundCanvas')) {
        const backgroundEffect = new BackgroundEffect();
        const mouseEffect = new MouseEffect();
        
        // 리플 효과 애니메이션
        function animateRipples() {
            mouseEffect.updateRipples();
            requestAnimationFrame(animateRipples);
        }
        animateRipples();
    }
});