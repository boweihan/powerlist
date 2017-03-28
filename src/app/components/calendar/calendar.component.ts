import { Component, OnInit } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-calendar',
    providers: [],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        $('.fullcalendar').fullCalendar({
            header: {
                center: 'listDay, listWeek, month'
            },
            editable: false,
            buttonText: {
                month: 'Month', listWeek: 'Week', listDay: 'Day'
            },
            eventColor: '#f5f5f5',
            height: "parent",
            eventAfterRender: function(event, element, view) {
                element.attr('data-toggle', 'tooltip');
                element.attr('title', event.tip);
                element.tooltip();
            }
        });
    }
}
