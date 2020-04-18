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
  fileName:string = "traduccion"

  area1:string="";
  area2:string="";
  area3:string=""
  ocultarJSON:boolean = true
  ocultarHTML:boolean = false
  ocultar:boolean = false;
  ocultarerror:boolean = true
  errores:Array<object> = []

  limpiar(){
    this.area1 = "";
    this.area2 = "";
    this.area3 = ""
    this.accion.sintactico.limpiar()
    while(this.errores.length!=0)this.errores.pop()
  }

  cambiaroculto(){
    this.ocultar = false
    this.ocultarerror = true
  }

  ocultarJ(){
    this.ocultarHTML = false
    this.ocultarJSON = true
  }

  ocultarH(){
    this.ocultarHTML = true
    this.ocultarJSON = false
  }

  traducir(){
    this.limpiar()
    this.cambiaroculto()
    console.log(this.ocultarerror)
    if(this.fileContent.length!=0){
      this.accion.sintactico.parser(this.fileContent);
      if(this.accion.sintactico.errores.length==0){
        this.accion.sintactico.cadenas.forEach(element => {
          this.area1 += element + "\n";
        });
      }else this.area1 = "No se pudo generar la traduccion, la entrada contiene errores";
    }
  }

  generarHJ(){
    this.cambiaroculto()
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
    while(this.errores.length!=0)this.errores.pop()
    if(this.accion.sintactico.lexico.tokens.length != 0){
      this.accion.sintactico.lexico.errores.forEach(m => {
        this.errores.push({
          tipo: "lexico",
          linea: m.linea, 
          col:m.columna,
          descripcion: "El caracter " + m.lexema + " no es valido"
        });
      });
      this.accion.sintactico.errores.forEach(m=>{
        this.errores.push({
          tipo:"sintactico",
          linea: m.linea,
          col: m.columna,
          descripcion: m.descripcion
        });
      })
    }
    this.ocultar = true
    this.ocultarerror = false
  }
  //ABRIR ARCHIVOS
  public onChange(fileList: FileList): void {
    this.limpiar()
    let file = fileList[0];
    this.fileName = file.name
    console.log(this.fileName)
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function(x) {
      self.fileContent = fileReader.result.toString();
    }
    fileReader.readAsText(file);
  }
}
