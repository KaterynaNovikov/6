export const user = {
    data: function () {
      return {
        parent: "",
        data: {},
        user: [],
        tab: 0,
        tabs: ["Statistic", "Sites", "Payments"],
        date: "",
        date2: "",
        iChart: -1,
        loader: 1,
      };
    },
  
    mounted: function () {
      this.parent = this.$parent.$parent;
  
      if (!this.parent.user) {
        this.parent.logout();
      }
  
      if (!this.parent.$route.params.id) {
        this.parent.page("/users");
      }
  
      this.get();
      this.GetFirstAndLastDate();
    },
  
    methods: {
      GetFirstAndLastDate: function () {
        let year = new Date().getFullYear();
        let month = new Date().getMonth();
  
        let firstDayOfMonth = new Date(year, month, 2);
        let lastDayOfMonth = new Date(year, month + 1, 1);
  
        this.date = firstDayOfMonth.toISOString().substring(0, 10);
        this.date2 = lastDayOfMonth.toISOString().substring(0, 10);
      },
  
      get: function () {
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
  
        data.append("id", this.parent.$route.params.id);
        data.append("uid", this.parent.$route.params.id);
  
        if (this.date !== "") data.append("date", this.date);
        if (this.date2 !== "") data.append("date2", this.date2);
  
        self.loader = 1;
  
        axios
          .post(this.parent.url +"/site/getUser?auth=" + this.parent.user.auth, data)
          .then(function (response) {
            self.loader = 0;
            self.data = response.data;
  
            if (self.data.info) self.user = self.data.info;
            document.title = self.data.info.user;
          })
          .catch(function (error) {
            self.parent.logout();
          });
      },
  
      action: function () {
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
  
        axios
          .post(this.parent.url + "/site/actionUser?auth=" + this.parent.user.auth, data)
          .then(function (response) {
            if (response.data.error) {
              self.$refs.header.$refs.msg.alertFun(response.data.error);
              return false;
            } else {
              self.$refs.new.active = 0;
            }
  
            if (self.parent.formData.id) {
              self.$refs.header.$refs.msg.successFun("Successfully updated user!");
            } else {
              self.$refs.header.$refs.msg.successFun("Successfully added new user!");
            }
  
            self.get();
          })
          .catch(function (error) {
            console.log("errors: ", error);
          });
      },
  
      del: async function () {
        if (
          await this.$refs.header.$refs.msg.confirmFun(
            "Please confirm next action",
            "Do you want to delete this user?"
          )
        ) {
          var self = this;
          var data = self.parent.toFormData(self.parent.formData);
  
          axios
            .post(this.parent.url +"/site/deleteUser?auth=" + this.parent.user.auth, data)
            .then(function (response) {
              self.$refs.header.$refs.msg.successFun("Successfully deleted user!");
              self.get();
            })
            .catch(function (error) {
              console.log("errors: ", error);
            });
        }
      },
  
      actionStatistic: function () {
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
  
        data.append("uid", this.parent.$route.params.id);
  
        axios
          .post(this.parent.url + "/site/actionStatistic?auth=" + this.parent.user.auth, data)
          .then(function (response) {
            if (response.data.error) {
              self.$refs.header.$refs.msg.alertFun(response.data.error);
              return false;
            }
  
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
      delPayment: async function () {
        if (
          await this.$refs.header.$refs.msg.confirmFun(
            "Please confirm next action",
            "Do you want to delete this payment?"
          )
        ) {
          var self = this;
          var data = self.parent.toFormData(self.parent.formData);
  
          axios
            .post(this.parent.url + "/site/deletePayment?auth=" + this.parent.user.auth, data)
            .then(function (response) {
              self.$refs.header.$refs.msg.successFun("Successfully deleted payment!");
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
      actionSite: function () {
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
  
        axios
          .post(this.parent.url + "/site/actionSite?auth=" + this.parent.user.auth, data)
          .then(function (response) {
            if (self.parent.formData.id) {
              self.$refs.header.$refs.msg.successFun("Successfully updated site!");
            } else {
              self.$refs.header.$refs.msg.successFun("Successfully added new site!");
            }
          })
          .catch(function (error) {
            console.log("errors: ", error);
          });
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
                  <img src="/app/views/images/logo.svg" alt="Logo">
              </div>
  
          </header>
          <popup ref="new" :title="(parent.formData && parent.formData.id) ? 'Edit user' : 'New user'">
  <div class="form inner-form">
    <form @submit.prevent="action()" v-if="parent.formData">
      <div class="row">
        <label>Name</label>
        <input type="text" v-model="parent.formData.user" required>
      </div>

      <div class="row">
        <label>Phone</label>
        <input type="text" v-model="parent.formData.phone" required>
      </div>

      <div class="row">
        <label>Email</label>
        <input type="text" v-model="parent.formData.email" required>
      </div>

      <div class="row">
        <label>Password</label>
        <input type="text" v-model="parent.formData.password">
      </div>

      <div class="row">
        <button class="btn" v-if="parent.formData && parent.formData.id">Edit</button>
        <button class="btn" v-if="parent.formData && !parent.formData.id">Add</button>
      </div>
    </form>
  </div>
</popup>


<popup ref="chart" fullscreen="true" title="Chart">
  <div class="flex panel">
    <div class="w30 ptb25">
      <input type="date" v-model="date" @change="get()" />
      <input type="date" v-model="date2" @change="get()" />
    </div>

    <div class="w70 al">
      <div class="flex cubes" v-if="data.items[iChart]">
        <div class="w30 clicks">
          <div>Clicks</div>
          {{ data.items[iChart].clicks }}
        </div>
        <div class="w30 views">
          <div>Views</div>
          {{ data.items[iChart].views }}
        </div>
        <div class="w30 leads">
          <div>Leads</div>
          {{ data.items[iChart].leads }}
        </div>
        <div class="w30 ctr">
          <div>CTR</div>
          {{ (data.items[iChart].clicks * 100 / data.items[iChart].views).toFixed(2) }}%
        </div>
      </div>
    </div>
  </div>

  <div class="flex body">
    <div class="w30 ar filchart">
      <div class="itemchart ptb10" v-if="all">
        <toogle v-model="all" @update:modelValue="all = $event; checkAll($event)" />
        All
      </div>
      <div class="itemchart ptb10" v-if="data.items[iChart].sites" v-for="s in data.items[iChart].sites">
        <toogle v-model="s.include" @update:modelValue="s.include = $event; parent.formData = data.items[iChart]; get()" />
        {{ s.site }}
      </div>
    </div>

    <div class="w70" id="chartOuter">
      <div id="chartHints">
        <div class="chartHintsViews">Views</div>
        <div class="chartHintsClicks">Clicks</div>
      </div>
      <canvas id="myChart"></canvas>
    </div>
  </div>
</popup>
<div id="spinner" v-if="loader"></div>

<div class="panelTop">
  <div class="wrapper">
    <div class="flex">
      <div class="w30 ptb30 pb0">
        <h1 v-if="data && data.info">{{ data.info.user }}</h1>
      </div>
      <div class="w50"></div>
      <div class="w20 al ptb20 pb0">
        <a class="btnS" href="#" @click.prevent="parent.formData = user; srefs.new.active = 1">
          <i class="fas fa-edit"></i> Edit user
        </a>
      </div>
    </div>

    <div class="flex" v-if="data && data.info">
      <div class="w50">
        <p><b>Phone:</b> {{ data.info.phone }}</p>
      </div>
      <div class="w50">
        <p><b>Email:</b> {{ data.info.email }}</p>
      </div>
    </div>

    <div class="tabs ar">
      <ul>
        <li v-if="tabs" v-for="(t, i) in tabs" :class="{ active: tabi === i }" @click="tab = i">{{ t }}</li>
      </ul>
    </div>
  </div>
</div>

<div v-if="tab === 1">
  <div class="flex panel">
    <div class="w20 ptb10">
      <h2>{{ tabs[tab] }}</h2>
    </div>
    <div class="w60 ptb20 ac">
      <input type="date" v-model="date" @change="get()" />
      <input type="date" v-model="date2" @change="get()" />
    </div>
    <div class="w20 ptb15 al"></div>
  </div>

  <popup ref="chart" fullscreen="true" title="Chart">
    <div class="flex panel">
      <div class="w30 ptb25">
        <input type="date" v-model="date" @change="get()" />
        <input type="date" v-model="date2" @change="get()" />
      </div>
      <div class="w70 al">
        <div class="flex cubes">
          <div class="w30 clicks">
            <div>Clicks</div>
            {{ data.sites[iChart]?.clicks || 0 }}
          </div>
          <div class="w30 views">
            <div>Views</div>
            {{ data.sites[iChart]?.views || 0 }}
          </div>
        </div>
      </div>
    </div>

    <div class="table" v-if="data.sites && data.sites.length">
      <table>
        <thead>
          <tr>
            <th class="id"></th>
            <th class="image">Site</th>
            <th class="id">Views</th>
            <th class="id">Clicks</th>
            <th class="id">Leads</th>
            <th class="id">Fraud clicks</th>
            <th class="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in data.sites" :key="i">
            <td class="id">
              <toggle v-model="item.published" @update:modelValue="(val) => (item.published = val)" />
            </td>
            <td class="image">{{ item.site }}</td>
            <td class="id">{{ item.views }}</td>
            <td class="id">{{ item.clicks || 0 }}</td>
            <td class="id">{{ item.leads || 0 }}</td>
            <td class="id">
              <a href="#" @click.prevent="$refs.details.active = 1; getDetails(item.id, 4)">
                {{ item.fclicks || 0 }}
              </a>
            </td>
            <td class="actions">
              <a href="#" @click.prevent="parent.formData = item; iChart = i; $refs.chart.active = 1; line(item)">
                <i class="fas fa-chart-bar"></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </popup>
</div>

<div v-if="tab === 2">
  <div class="flex panel">
    <div class="w30 ptb10">
      <h2>{{ tabs[tab] }}</h2>
    </div>
    <div class="w50"></div>
    <div class="w20 al ptb15">
      <a class="btnS" href="#" @click.prevent="parent.formData = {}; $refs.payment.active = 1">
        <i class="fas fa-plus"></i> Add payment
      </a>
    </div>
  </div>

  <popup ref="payment" :title="parent.formData && parent.formData.id ? 'Edit payment' : 'New payment'">
    <div class="form inner-form">
      <form @submit.prevent="actionPayment()" v-if="parent.formData">
        <div class="row">
          <label>Value</label>
          <input type="number" v-model="parent.formData.value" required />
        </div>
        <div class="row">
          <label>Date</label>
          <input type="date" v-model="parent.formData.date" required />
        </div>
        <div class="row">
          <label>Description</label>
          <input type="text" v-model="parent.formData.description" />
        </div>
        <div class="row">
          <button class="btn" v-if="parent.formData.id">Edit</button>
          <button class="btn" v-else>Add</button>
        </div>
      </form>
    </div>
  </popup>

  <div class="table" v-if="data.payments && data.payments.length">
    <table>
      <thead>
        <tr>
          <th class="id">#</th>
          <th class="id">Value</th>
          <th>Date</th>
          <th>Description</th>
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data.payments" :key="item.id">
          <td class="id">{{ item.id }}</td>
          <td class="id">
            <a href="#" @click.prevent="parent.formData = item; $refs.payment.active = 1;">{{ item.value }}</a>
          </td>
          <td>
            <a href="#" @click.prevent="parent.formData = item; $refs.payment.active = 1;">{{ item.date_title }}</a>
          </td>
          <td>{{ item.description }}</td>
          <td class="actions">
            <a href="#" @click.prevent="parent.formData = item; $refs.payment.active = 1;">
              <i class="fas fa-edit"></i>
            </a>
            <a href="#" @click.prevent="parent.formData = item; delPayment();">
              <i class="fas fa-trash-alt"></i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

  `,
};
