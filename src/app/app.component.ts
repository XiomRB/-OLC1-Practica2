import { Component } from '@angular/core';
import { Accion } from './Logica/Accion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title:string = 'TraductorPython';
  accion:Accion = new Accion();
  fileContent: string = '';

  area1:string="";
  area2:string="";
  area3:string=""
  ocultarJSON:boolean = true
  ocultarHTML:boolean = false

  limpiar(){
    this.area1 = "";
    this.area2 = "";
    this.area3 = ""
    this.accion.sintactico.limpiar()
  }

  traducir(){
    this.limpiar()
    if(this.fileContent.length!=0){
      this.accion.sintactico.parser(this.fileContent);
      if(this.accion.sintactico.errores.length==0){
        this.accion.sintactico.cadenas.forEach(element => {
          this.area1 += element + "\n";
        });
      }else this.area1 = "No se pudo generar la traduccion, la entrada contiene errores";
    }
  }

  ocultarJ(){
    this.ocultarHTML = false
    this.ocultarJSON = true
  }

  ocultarH(){
    this.ocultarHTML = true
    this.ocultarJSON = false
  }

  generarHJ(){
    this.area2 = ""
    if(this.accion.sintactico.lexico.tokens.length!=0){
      if(this.accion.sintactico.errores.length==0){
        this.accion.crearHTML()
        this.area2 += this.accion.htmlfinal
        this.area3 += this.accion.jsonfinal
      }
    }
  }

  generarreporte(){
    if(this.accion.sintactico.lexico.tokens.length != 0){
      this.accion.sintactico.lexico.errores.forEach(error => {
        
      });
      this.accion.sintactico.errores.forEach(error=>{

      })
    }
  }
  //ABRIR ARCHIVOS
  public onChange(fileList: FileList): void {
    this.limpiar()
    let file = fileList[0];
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function(x) {
      self.fileContent = fileReader.result.toString();
    }
    fileReader.readAsText(file);
  }
}
