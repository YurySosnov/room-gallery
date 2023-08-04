const {createApp, ref} = Vue;

createApp({
    data() {
        return {
            ratio: '3/2',
            ratioNum: 1.5,
            ratios: ['21/9', '18/9', '16/9', '16/10', '3/2', '4/3', '1/1'],
            perspective: 'flat',
            perspectives: ['flat','perspective'],
            renderSize: 1,
            roomWidth: 1,
            image64: null,
            imageUrl: null,
            imageSrc: null,
            isMeterDrag: false,
            isMeterResize: false,
            meterValue: 100,
            meter: {
                w: 20,
                x: 50,
                y: 50,
            },
            meterResizePoint: '',
            cX: 0,
            cY: 0,
            cSX: 0,
            cSY: 0,
            mSX: 0,
            mSY: 0,
            mSW: 0,
            setRatio(ratio) {
                this.ratio = ratio;

                let r = ratio.split('/');
                this.ratioNum = r[0] / r[1];
            },
            useImage(key) {
                switch (key) {
                    case 'url':
                        this.imageSrc = this.imageUrl;
                        break;
                    case '64':
                        this.imageSrc = this.image64;
                        break;
                    default:
                        break;
                }
            },
            getFileName(str) {
                let name = '';
                let strItems = str.split('/');
                let fileName = strItems[strItems.length - 1];
                let nameItems = fileName.split('.');
                for (let i = 0, len = nameItems.length; i < len - 1; i++) {
                    name += nameItems[i];
                    if (i < len - 2) {
                        name += '.';
                    }
                }
                return name;
            },
            readImage(e) {
                const self = this;
                if (!e.target.files || !e.target.files[0]) return;
                let fileName = this.getFileName(e.target.files[0].name);
                const FR = new FileReader();
                FR.onloadend = function (e) {
                    self.image64 = e.target.result;
                    self.useImage('64');
                };
                FR.readAsDataURL(e.target.files[0]);
            },
            updateRectSize() {
                const rect = document.getElementById('rg-room').getBoundingClientRect();
                this.renderSize = rect.width;
            },
            getPosition(e) {
                const rect = document.getElementById('rg-room').getBoundingClientRect();
                const rx = rect.x;
                const ry = rect.y;
                const rw = rect.width;
                const rh = rect.height;
                let x = ((e.clientX - rx) / rw * 100).toFixed(4);
                let y = ((e.clientY - ry) / rh * 100).toFixed(4);
                return {x, y};
            },
            meterDrag(e) {
                if (!this.isMeterDrag) return false;
                const rect = document.getElementById('rg-room').getBoundingClientRect();
                let pos = this.getPosition(e);

                let delta = {
                    x: parseFloat(pos.x) - parseFloat(this.cSX),
                    y: parseFloat(pos.y) - parseFloat(this.cSY)
                };
                let x = parseFloat(this.mSX) + delta.x;
                let y = parseFloat(this.mSY) + delta.y;
                this.meter.x = x.toFixed(4);
                this.meter.y = y.toFixed(4);
            },
            meterDragStart(e, index) {
                this.mSX = this.meter.x;
                this.mSY = this.meter.y;
                let pos = this.getPosition(e);
                this.cSX = pos.x;
                this.cSY = pos.y;
                this.isMeterDrag = true;
            },
            meterDragEnd() {
                this.isMeterDrag = false;
            },
            meterResizeStart(e,point) {
                e.stopPropagation();
                this.mSX = parseFloat(this.meter.x);
                this.mSY = parseFloat(this.meter.y);
                this.mSW = parseFloat(this.meter.w);
                let pos = this.getPosition(e);
                this.cSX = pos.x;
                this.cSY = pos.y;
                this.isMeterResize = true;
                this.meterResizePoint = point;
            },
            meterResizeEnd(e,point) {
                e.stopPropagation();
                this.isMeterResize = false;
            },
            meterResize(e) {
                let pos = this.getPosition(e);
                let point = this.meterResizePoint;

                let qx = 1;
                let qy = 1;

                switch (point) {
                    case 'lt': qx = -1; qy = -1; break;
                    case 'rt': qx = 1; qy = -1; break;
                    case 'lb': qx = -1; qy = 1; break;
                    case 'rb': qx = 1; qy = 1; break;
                }

                let delta = {
                    x: (pos.x - this.cSX),
                    y: (pos.y - this.cSY)
                };

                let dW = delta.x * qx;

                let x = parseFloat(this.mSX) + (dW / 2) * qx;
                let y = parseFloat(this.mSY) + (dW * this.ratioNum / 2) * qy;

                this.meter.w = Math.abs(this.mSW + dW).toFixed(4);
                this.meter.x = x.toFixed(4);
                this.meter.y = y.toFixed(4);
            },
            moveOnRoom(e) {
                if (this.isMeterDrag) {
                    this.meterDrag(e);
                }
                if (this.isMeterResize) {
                    this.meterResize(e);
                }
            },
            reset() {
                this.meter.w = 20;
                this.meter.x = 50;
                this.meter.y = 50;
            }
        }
    },
    mounted() {
        const self = this;
        self.updateRectSize();
        window.addEventListener('resize', () => {
            self.updateRectSize();
        });
    },
}).mount('#room-gallery');