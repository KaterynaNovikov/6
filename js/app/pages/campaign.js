export const campaign = {
    data: function () {
      return {
        parent: "",
        data: {},
        details: {},
        date: "",
        date2: "",
        q: "",
        sort: "",
        loader: 1,
        iChart: -1,
        id: 0,
        type: 0,
        all: true,
      };
    },
  
    mounted: function () {
        if (!this.$parent || !this.$parent.$parent) {
          console.error("Parent component is not defined!");
          return;
        }
      
        this.parent = this.$parent.$parent;
      
        if (!this.parent.user) {
          this.parent.logout();
          return;
        }
      
        this.get();
        this.GetFirstAndLastDate();
      },
  
    methods: {
      GetFirstAndLastDate: function () {
        var year = new Date().getFullYear();
        var month = new Date().getMonth();
  
        var firstDayOfMonth = new Date(year, month, 1);
        var lastDayOfMonth = new Date(year, month + 1, 0);
  
        this.date = firstDayOfMonth.toISOString().substring(0, 10);
        this.date2 = lastDayOfMonth.toISOString().substring(0, 10);
      },
  
      get: function () {
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
  
        if (this.date !== "") data.append("date", this.date);
        if (this.date2 !== "") data.append("date2", this.date2);
  
        data.append("id", this.parent.$route.params.id);
  
        self.loader = 1;
  
        axios.post(this.parent.url + "/site/getBanners?auth=" + this.parent.user.auth, data)
        .then(function (response) {
          if (!response.data || !response.data.items) {
            console.warn("Invalid response format or missing items");
            return;
          }
      
          self.loader = 0;
          self.data = response.data;
          document.title = self.data.info.title;
      
          if (self.iChart !== -1 && self.data.items[self.iChart]) {
            self.line(self.data.items[self.iChart]);
          }
        })
        .catch(function (error) {
          console.error("Error fetching banners:", error);
          self.parent.logout();
        });
      },
  
      getDetails: function (bid = false, type = false) {
        this.details = {};
  
        if (bid) this.id = bid;
        if (type) this.type = type;
  
        if (this.id) bid = this.id;
        if (this.type) type = this.type;
  
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
  
        if (this.date !== "") data.append("date", this.date);
        if (this.date2 !== "") data.append("date2", this.date2);
        if (this.q !== "") data.append("q", this.q);
        if (this.sort !== "") data.append("sort", this.sort);
        if (bid !== "") data.append("bid", bid);
        if (type !== "") data.append("type", type);
  
        self.loader = 1;
  
        axios
          .post(this.parent.url + "/site/getStatisticsDetails?auth=" + this.parent.user.auth, data)
          .then(function (response) {
            self.details = response.data;
            self.loader = 0;
          })
          .catch(function (error) {
            self.parent.logout();
          });
      },
  
      action: function () {
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
  
        axios
          .post(this.parent.url + "/site/actionCampaign?auth=" + this.parent.user.auth, data)
          .then(function (response) {
            self.$refs.new.active = 0;
  
            if (self.parent.formData.id) {
              self.$refs.header.$refs.msg.successFun("Successfully updated campaign!");
            } else {
              self.$refs.header.$refs.msg.successFun("Successfully added new campaign!");
            }
  
            self.get();
          })
          .catch(function (error) {
            console.log("errors: ", error);
          });
      },
  
      actionAd: function () {
        var self = this;
        self.parent.formData.copy = "";
  
        var data = self.parent.toFormData(self.parent.formData);
        data.append("campaign", this.parent.$route.params.id);
  
        axios
          .post(this.parent.url + "/site/actionBanner?auth=" + this.parent.user.auth, data)
          .then(function (response) {
            self.$refs.ad.active = 0;
  
            if (self.parent.formData.id) {
              self.$refs.header.$refs.msg.successFun("Successfully updated banner!");
            } else {
              self.$refs.header.$refs.msg.successFun("Successfully added new banner!");
            }
  
            self.get();
          })
          .catch(function (error) {
            console.log("errors: ", error);
          });
      },
      delAd: async function () {
        if (await this.$refs.header.$refs.msg.confirmFun("Please confirm next action", "Do you want to delete this banner?")) {
          var self = this;
          var data = self.parent.toFormData(self.parent.formData);
  
          axios
            .post(this.parent.url + "/site/deleteBanner?auth=" + this.parent.user.auth, data)
            .then(function (response) {
              self.$refs.header.$refs.msg.successFun("Successfully deleted banner!");
              self.get();
            })
            .catch(function (error) {
              console.log("errors: ", error);
            });
        }
      },

    line:function (item) {
        setTimeout(function () {
            let dates = [];
            let clicks = [];
            let views = [];
            let leads = [];
    
            if (item && item['line']) {
                for (let i in item['line']) {
                    dates.push(i);
                    clicks.push(item['line'][i].clicks);
                    views.push(item['line'][i].views);
                    leads.push(item['line'][i].leads);
                }
            }
    
            document.getElementById('chartOuter').innerHTML = `
                <div id="chartHints">
                    <div class="chartHintsViews">Views</div>
                    <div class="chartHintsClicks">Clicks</div>
                </div>
            `;
            const ctx = document.getElementById('myChart')
    
            const xScaleImage = {
                id: "xScaleImage",
                afterDatasetsDraw(chart,args,plugins) {
                    const { ctx, data, chartArea:{bottom}, scales: { x } } = chart;
                    ctx.save();
                        data.images.forEach((image, index) => {
                            const label = new Image();
                            label.src = image;
                            const width = 120;
                            ctx.drawImage(label, x.getPixelForValue(index) - (width / 2), x.top, width, width);
                        });
                    
                }
            };
    
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: "Clicks",
                            backgroundColor: "#005990",
                            borderColor: "#005990",
                            data: clicks
                        },
                        {
                            label: "Views",
                            backgroundColor: "#ff9900",
                            borderColor: "#ff9900",
                            data: views
                        },
                    ]
                },
                options: {
                  responsive:true,
                    plugins: {
                        tooltip: {
                            bodyFont: {
                                size: 20
                            },
                            usePointStyle: true,
                            callbacks: {
                                title: (ctx) => ctx[0].dataset.label
                            }
                        },
                        legend: {
                            display: false
                        }
                    },
                    categoryPercentage:0.2,
                    barPercentage:0.8,
                    scales: {
                        y: {
                            id: 'y2',
                            position: 'right'
                        },
                        x: {
                            afterFit: (scale) => {
                                scale.height = 120;
                            }
                        }
                    }
                },
            });
        }, 100);
      },
        checkAll:function(prop){
          if(this.data.items[this.iChart].sites) {
          for(let i in this.data.items[this.iChart].sites){
          this.data.items[this.iChart].sites[i].include = prop;
          } 
          }
          this.parent.formData = this.data.items[this.iChart];
          this.get();
        }
    },

  template: `
<div class="campaigns-page">
  <div class="inside-content">


    <header class="header">
      <div id="user-top" @click="toggleActive()">
        <div id="user-circle">{{ parent.user.user[0] }}</div>
        <div id="user-info" :class="{ active: active }">
          <a href="#" @click.prevent="logout()">
            <i class="fas fa-sign-out-alt"></i> Log out
          </a>
        </div>
      </div>

      <nav class="menu">
        <ul>
          <li>
            <router-link to="/users" :class="{ 'router-link-active': $route.path.includes('user') }">
              <i class="fas fa-user"></i> Users
            </router-link>
          </li>
          <li>
            <router-link to="/campaigns" :class="{ 'router-link-active': $route.path.includes('campaign') }">
              <i class="fas fa-bullhorn"></i> Campaigns
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="logo">
        <img src="images/logo.svg" alt="Logo">
      </div>
    </header>


    <div class="wrapper">
      <div class="flex">
        <div class="w30 ptb30">
          <h1 v-if="data && data.info">{{ data.info.title }}</h1>
        </div>
        <div class="w70 al ptb28">
          <a class="btnS" href="#" @click.prevent="parent.formData = data.info; $refs.new.active = 1">
            <i class="fas fa-edit"></i> Edit
          </a>
        </div>
      </div>
    </div>


    <popup ref="new" :title="parent.formData && parent.formData.id ? 'Edit campaign' : 'New campaign'">
      <div class="form inner-form">
        <form @submit.prevent="action()" v-if="parent.formData">
          <div class="row">
            <label>Name</label>
            <input type="text" v-model="parent.formData.title" required>
          </div>
          <div class="row">
            <button class="btn" v-if="parent.formData.id">Edit</button>
            <button class="btn" v-else>Add</button>
          </div>
        </form>
      </div>
    </popup>


   <div class="wrapper">
  <div class="table" v-if="data.items.length">
    <table>
      <thead>
        <tr>
          <th class="actions">Actions</th>
          <th>Fraud Clicks</th>
          <th>Leads</th>
          <th>Clicks</th>
          <th>Views</th>
          <th>Title</th>
          <th>Link</th> 
          <th>Size</th> 
          <th>#</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in data.items" :key="i">
          <td class="actions">
            <router-link :to="'/campaign/' + item.id">
              <i class="fas fa-edit"></i>
            </router-link>
            <a href="#" @click.prevent="parent.formData = item; iChart = i; $refs.chart.active = 1; line(item);">
              <i class="fas fa-chart-bar"></i>
            </a>
            <a href="#" @click.prevent="parent.formData = item; del();">
              <i class="fas fa-trash-alt"></i>
            </a>
          </td>
          <td>
            <a href="#" @click.prevent="$refs.details.active=1; getDetails(item.id, 4)">
              {{ item.fclicks || 0 }}
            </a>
          </td>
          <td>
            <a href="#" @click.prevent="$refs.details.active=1; getDetails(item.id, 3)">
              {{ item.leads || 0 }}
            </a>
          </td>
          <td>
            <a href="#" @click.prevent="$refs.details.active=1; getDetails(item.id, 1)">
              {{ item.clicks || 0 }}
            </a>
          </td>
          <td>
            <a href="#" @click.prevent="$refs.details.active=1; getDetails(item.id, 2)">
              {{ item.views || 0 }}
            </a>
          </td>
          <td>
            <router-link :to="'/campaign/' + item.id">
              {{ item.title }}
            </router-link>
          </td>
          <td>
            <a :href="item.link" target="_blank">{{ item.link }}</a> 
          </td>
          <td>
            {{ item.size || 'N/A' }} 
          </td>
          <td>{{ item.id }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="empty" v-if="!data.items.length">No items</div>
</div>



    <popup ref="chart" fullscreen="true" title="Chart">
      <div class="flex panel">
        <div class="w30 ptb25">
          <input type="date" v-model="date" @change="get()" />
          <input type="date" v-model="date2" @change="get()" />
        </div>
        <div class="w70 al">
          <div class="flex cubes" v-if="data.items[iChart]">
            <div class="w30 clicks">Clicks {{ data.items[iChart].clicks }}</div>
            <div class="w30 views">Views {{ data.items[iChart].views }}</div>
            <div class="w30 leads">Leads {{ data.items[iChart].leads }}</div>
            <div class="w30 ctr">
              CTR {{ (data.items[iChart].clicks * 100 / data.items[iChart].views).toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>

      <div class="w70" id="chartOuter">
        <div id="chartHints">
          <div class="chartHintsViews">Views</div>
          <div class="chartHintsClicks">Clicks</div>
        </div>
        <canvas id="myChart"></canvas>
      </div>
    </popup>


    <popup ref="ad" :title="parent.formData && parent.formData.id ? 'Edit banner' : 'New banner'">
      <div class="form inner-form">
        <form @submit.prevent="actionAd()" v-if="parent.formData">
          <div class="row">
            <label for="link">Link</label>
            <input type="text" id="link" v-model="parent.formData.link" required>
          </div>
          <div class="row">
            <label for="description">Description</label>
            <input type="text" id="description" v-model="parent.formData.description">
          </div>
          <div class="row">
            <label for="type">Type</label>
            <select id="type" v-model="parent.formData.type" required>
              <option value="0"></option>
              <option v-if="data.types" v-for="c in data.types" :value="c.id">
                {{ c.title }}
              </option>
            </select>
          </div>
          <div class="row">
            <label>Image</label>
            <Image :modelValue="parent.formData.img" @update:modelValue="parent.formData.img = $event;" />
          </div>
          <div class="row">
            <button class="btn" v-if="parent.formData.id">Edit</button>
            <button class="btn" v-else>Add</button>
          </div>
        </form>
      </div>
    </popup>

  </div>
</div>



  `,
};
