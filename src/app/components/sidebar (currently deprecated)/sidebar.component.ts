import { Component, OnInit } from '@angular/core';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service/category.service';
import { TaskService } from '../../services/task-service/task.service';
import { CategoryService } from '../../services/category-service/category.service';
import { Colors } from '../../shared/app-colors';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  providers: [CategoryService],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

}
