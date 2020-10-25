import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Mensaje } from '../interfaces/mensaje.interface';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public chats:Mensaje[]=[];
  public usuario:any={};

  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  constructor(private afs:AngularFirestore, public AFauth:AngularFireAuth) {
    AFauth.authState.subscribe(user =>{
      console.log(user);

      if (!user) {
        return;
      }else{
        this.usuario.nombre=user.displayName;
        this.usuario.uid=user.uid;
      }
    })
   }


  login(){
    this.AFauth.signInWithPopup(new auth.GoogleAuthProvider());
  }
  
  logout() {
    this.usuario={};
    this.AFauth.signOut();
  }


  cargarMensajes(){
    // primero se envia la lista, y luego la query.
    this.itemsCollection= this.afs.collection<Mensaje>('chats', ref=>ref.orderBy('fecha','desc').limit(5));
    
    return this.itemsCollection.valueChanges().pipe(
      map((mensajes:Mensaje[])=>{
        console.log(mensajes);
        
        this.chats=[];
        mensajes.forEach(mensaje=>{
          this.chats.unshift(mensaje);
        })


      })
    )
  }

  agregarMensaje(texto:string){

    let mensaje:Mensaje={
      nombre: this.usuario.nombre,
      mensaje:texto,
      fecha: new Date().getTime(),
      uid:this.usuario.uid
    }
    return this.itemsCollection.add(mensaje)
  }

}
