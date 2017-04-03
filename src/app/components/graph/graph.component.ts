import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task-service/task.service';

declare let $: any;
declare let bootbox: any;

declare let echarts: any;
@Component({
    selector: 'app-graph',
    providers: [TaskService],
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

    private dateArray = []; // TODO implement this on the server side
    private valueArray = [];
    private lineChart;
    private pieChart;

    constructor(
        private taskService: TaskService,
    ) { }

    ngOnInit() {
        let that = this;
        this.lineChart = echarts.init(document.getElementById('graph'));
        this.pieChart = echarts.init(document.getElementById('pie'));
        this.initLoadingModal();
        this.initCharts();
        window.addEventListener('resize', this.lineChart.resize, false);
        window.addEventListener('resize', this.pieChart.resize, false);
    }

    initLoadingModal() { // this should be in a parent component, duplicate in list
        $('.boop').loadingModal({
          position: 'fixed',
          text: '',
          color: '#fff',
          opacity: '0.7',
          backgroundColor: 'rgb(0,0,0)',
          animation: 'cubeGrid'
        });
    }

    initCharts() {
        $('.boop').show();
        var that = this;
        this.taskService.getTasksForUser(localStorage.getItem("user_id")).subscribe(
            tasks => {
                for (var i = 0, len = tasks.length; i < len; i++) {
                    let startDate = new Date(tasks[i].start);
                    let endDate = new Date(tasks[i].end);
                    that.addDatesToDateArray(startDate, endDate);
                }
                that.constructDatesAndValues();
                that.constructChartOptions(that.dateArray, that.valueArray);
                let pieChartData = that.constructPieObject(tasks);
                that.constructPieChartOptions(pieChartData);
                $('.boop').hide();
            },
            err => {
                bootbox.alert("Server error, you may be disconnected from the internet");
            }
        )
    }

    constructPieObject(tasks) {
        let hashMap = {};
        for (var i = 0, len = tasks.length; i < len; i++) {
            if (hashMap[tasks[i].category.name] === undefined) {
                hashMap[tasks[i].category.name] = 0;
            } else {
                hashMap[tasks[i].category.name] = hashMap[tasks[i].category.name] + 1;
            }
        }
        return hashMap;
    }

    constructPieChartOptions(data) {
        let legendData = [];
        let seriesData = [];

        for (var key in data) {
            legendData.push(key);
            seriesData.push({'value':data[key], 'name':key});
        }

        var option = {
            title : {
                text: 'Distribution',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                top: '20%',
                left : '65%',
                orient : 'vertical',
                data:legendData
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    // dataView : {
                    //     show: false,
                    //     readOnly: true,
                    //     title: 'Data'
                    // },
                    magicType : {
                        show: true,
                        type: ['pie', 'funnel'],
                        title: 'Switch Types'
                    },
                    restore : {
                        show: true,
                        title: 'reset'
                    },
                    saveAsImage : {
                        show: true,
                        title: 'download'
                    }
                },
                right: '10%',
                top: '20px'
            },
            calculable : true,
            series : [
                {
                    name:'Distribution',
                    type:'pie',
                    radius : ['5%', '70%'],
                    center : ['35%', '50%'],
                    roseType : 'radius',
                    width: '50%',       // for funnel
                    max: 40,            // for funnel
                    itemStyle : {
                        normal : {
                            label : {
                                show : false
                            },
                            labelLine : {
                                show : false
                            }
                        }
                    },
                    data:seriesData
                }
            ]
        };
        this.pieChart.setOption(option);
    }
    constructChartOptions(date, data) {
        let option = {
            tooltip: {
                trigger: 'axis',
                position: function (pt) {
                    return [pt[0], '10%'];
                }
            },
            title: {
                left: 'center',
                text: 'Timeline',
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        title: {
                            zoom: 'enable zoom',
                            back: 'zoom out'
                        },
                        yAxisIndex: 'none'
                    },
                    restore: {
                        title: 'reset'
                    },
                    saveAsImage: {
                        title: 'download'
                    }
                },
                right: '10%',
                top: '20px'
            },
            backgroundColor: 'whitesmoke',
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: date,
                axisLabel : {
                    formatter : function (value, index) {
                        return value.toString().split(' ').splice(1, 3).join(' ');
                    }
                }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                name: 'number of tasks',
                nameRotate: 90,
                nameLocation: 'middle',
                nameGap: 40
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100
            }, {
                start: 0,
                end: 100,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '100%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }],
            series: [
                {
                    name:'Data',
                    type:'line',
                    smooth:true,
                    symbol:'none',
                    sampling:'average',
                    itemStyle: {
                        normal: {
                            color:'rgb(255, 70, 131)'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color:'rgb(255, 158, 68)'
                            }, {
                                offset: 1,
                                color:'rgb(255, 70, 131)'
                            }])
                        }
                    },
                    data: data
                }
            ]
        };
        this.lineChart.setOption(option);
    }

    addDatesToDateArray(startDate, stopDate) { //refactor
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            currentDate.setSeconds(0);
            currentDate.setMinutes(0);
            currentDate.setHours(0);
            this.dateArray.push(currentDate);
            let currentMS = currentDate.getTime();
            currentDate.setTime(currentMS + 86400000);
        }
    }

    getInnerDaysObject(startDate, stopDate) {
        let daysInBetween = {}
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            currentDate.setSeconds(0);
            currentDate.setMinutes(0);
            currentDate.setHours(0);
            daysInBetween[currentDate] = 0;
            let currentMS = currentDate.getTime();
            currentDate = new Date(currentMS + 86400000);
        }
        return daysInBetween;
    }

    constructDatesAndValues() { // TODO: this method is awful and shouldn't be here
        let newDateArray = [];
        let newValueArray = [];
        let combinedArray = [];

        this.dateArray.sort(function(date1, date2) {
            if (date1 > date2) return 1;
            if (date1 < date2) return -1;
            return 0;
        });

        let firstDate = this.dateArray[0];
        let lastDate = this.dateArray[this.dateArray.length - 1];
        let newDateObject = this.getInnerDaysObject(firstDate, lastDate);
        for (var i = 0, len = this.dateArray.length; i < len; i++) { // increment map values
            newDateObject[this.dateArray[i]] = newDateObject[this.dateArray[i]] + 1;
        }
        for (var key in newDateObject) { // push object into multidimensional array
            combinedArray.push([new Date(key), newDateObject[key]]);
        }
        combinedArray.sort(function(date1, date2) { // sort array
            if (date1[0] > date2[0]) return 1;
            if (date1[0] < date2[0]) return -1;
            return 0;
        });
        this.dateArray.length = 0;
        this.valueArray.length = 0;
        for (var i = 0, len = combinedArray.length; i < len; i++) {
            this.dateArray.push(combinedArray[i][0]);
            this.valueArray.push(combinedArray[i][1]);
        }
    }
}
