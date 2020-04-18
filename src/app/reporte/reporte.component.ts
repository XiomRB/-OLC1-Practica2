import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {
  @Input() errores;
  constructor() { }

  ngOnInit(): void {
  }

}
