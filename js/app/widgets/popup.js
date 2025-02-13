export const popup = { 
  props: ["title", "fullscreen"],

  data() {
    return {
      active: 0,
      top: "0",
      widthVal: "500px",
      ml: "-250px",
      left: "50%",
      height: "auto",
    };
  },

  watch: {
    active(o, n) {
      if (o === 1 && !this.fullscreen) {
        this.$nextTick(() => {
          let height = this.$refs.popup.clientHeight / 2;
          this.top = `calc(50% - ${height}px)`;
        });
      }

      if (this.fullscreen) {
        this.top = "0";
        this.widthVal = "100%";
        this.ml = "0";
        this.left = "0";
        this.height = "100%";
      }
    }
  },

  template: `
    <div v-if="active == 1">
      <div class="popup-back" @click="active = 0"></div>

      <div class="popup" 
        :style="{ top: top, 'max-width': widthVal, 'margin-left': ml, left: left, height: height }" 
        ref="popup">
        
        <div class="flex head-popup">
          <div class="w80 ptb20">
            <div class="head-title">{{ title }}</div>
          </div>
          <div class="w20 al ptb20">
            <a href="#" @click.prevent="active = 0">
              <i class="fas fa-window-close"></i>
            </a>
          </div>
        </div>

        <div class="popup-inner">
          <slot></slot>
        </div>
      </div>
    </div>
  `
};
