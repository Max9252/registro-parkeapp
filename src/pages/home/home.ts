import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { CurrencyPipe } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { LocationSelectPage } from '../location-select/location-select';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('signupSlider') signupSlider: any;

  slideOneForm: FormGroup;
  slideTwoForm: FormGroup;
  slideThreeForm: FormGroup;
  automoviles: boolean;
  bicicletas: boolean;
  motocicletas: boolean;
  horarioPersonalizado: boolean;
  depositoBancario: boolean;
  giroNacional: boolean;
  submitAttempt: boolean = false;
  direccion: string;
  valorMensualCarro: string;
  valorMensualBicicleta: string;
  valorMensualMotocicleta: string;
  imageOne: string;
  imageTwo: string;
  imageThree: string;
  imageFour: string;

  private vehiculoOpciones: Array<string>;
  private horarioOpciones: Array<string>;
  private opcionesPago: Array<string>;

  constructor(public navCtrl: NavController, public formBuilder: FormBuilder, public modalCtrl: ModalController, public camera: Camera, public actionSheetCtrl: ActionSheetController) {

    this.automoviles = false;
    this.bicicletas = false;
    this.motocicletas = false;
    this.horarioPersonalizado = false;
    this.giroNacional = false;
    this.depositoBancario = false;


    this.slideOneForm = formBuilder.group({
      ciudad: ['', Validators.required],
      departamento: ['', Validators.required],
      direccion: ['', Validators.compose([Validators.required])],
      vehiculos: ['', Validators.required],
      jornada: ['', Validators.required],
      horario: ['', Validators.required],
      apertura: ['', Validators.required],
      tamano: ['', Validators.required],
      caracteristicas: ['', Validators.required],
      descripcion: ['', Validators.required],
      espacioAutomovil: ['', Validators.required],
      valorMensualCarro: ['', Validators.required],
      espacioBicicleta: ['', Validators.required],
      valorMensualBicicleta: ['', Validators.required],
      espacioMotocicleta: ['', Validators.required],
      valorMensualMotocicleta: ['', Validators.required],
    });

    this.slideTwoForm = formBuilder.group({
      nombre: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      apellido: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      email: ['', Validators.compose([Validators.maxLength(30), Validators.required])],
      telefono: ['', Validators.compose([Validators.maxLength(10), Validators.required])],
      ciudad: ['', Validators.required],
      departamento: ['', Validators.required],
    });
    this.slideThreeForm = formBuilder.group({
      metodo: ['', Validators.required],
      entidadBancario : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      titular: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      tipoCuenta: ['', Validators.required],
      numeroCuenta: ['', Validators.required],
      cedula: ['', Validators.required],
      personaGiro : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])]
    });
  }

  ngAfterViewInit() {
    this.signupSlider.lockSwipes(true)
  }

  launchLocationPage() {

    let modal = this.modalCtrl.create(LocationSelectPage);

    modal.onDidDismiss((location) => {
      if (location != undefined) {
        console.log(location.address);
        this.direccion = location.address;
      }
    });

    modal.present();

  }

  onChangeVehiculoSelected() {
    let esValido;
    esValido = this.vehiculoOpciones.indexOf("automoviles") !== -1 ? this.automoviles = true : this.automoviles = false;
    esValido = this.vehiculoOpciones.indexOf("motocicletas") !== -1 ? this.motocicletas = true : this.motocicletas = false;
    esValido = this.vehiculoOpciones.indexOf("bicicletas") !== -1 ? this.bicicletas = true : this.bicicletas = false;
  }

  onChangeMetodoPago() {
    let esValido;
    esValido = this.opcionesPago.indexOf("giro") !== -1 ? this.giroNacional = true : this.giroNacional = false;
    esValido = this.opcionesPago.indexOf("deposito") !== -1 ? this.depositoBancario = true : this.depositoBancario = false;
  }

  formatValorCarro(ev) {
    this.valorMensualCarro = (ev);
  }
  formatValorBicicleta(ev) {
    this.valorMensualBicicleta = (ev);
  }
  formatValorMotocicleta(ev) {
    this.valorMensualMotocicleta = (ev);
  }

  openActionSheet(nameImg) {
    console.log('opening');
    let actionsheet = this.actionSheetCtrl.create({
      title: "Escoge",
      buttons: [
        {
          text: 'Cámara',
          icon: 'md-camera',
          handler: () => {
            this.openCamera(nameImg);
          }
        }, {
          text: 'Galería',
          icon: 'md-image',
          handler: () => {
            this.openGallery(nameImg);
          }
        }]
    });
    actionsheet.present();
  }

  openGallery(nameImg): void {
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 100,
      targetWidth: 150,
      targetHeight: 150,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions)
      .then((imageData) => {
        switch (nameImg) {
          case 1:
            this.imageOne = imageData;
            break;
          case 2:
            this.imageTwo = imageData;
            break;
          case 3:
            this.imageThree = imageData;
            break;
          case 4:
            this.imageFour = imageData;
            break;
        }
      }, (err) => {
        console.log(err);
      });
  }


  openCamera(nameImg): void {
    this.camera.getPicture({
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      correctOrientation: true,
      encodingType: this.camera.EncodingType.JPEG,
    }).then((imageData) => {
      switch (nameImg) {
        case 1:
          this.imageOne = "data:image/jpeg;base64," + imageData;
          break;
        case 2:
          this.imageTwo = "data:image/jpeg;base64," + imageData;
          break;
        case 3:
          this.imageThree = "data:image/jpeg;base64," + imageData;
          break;
        case 4:
          this.imageFour = "data:image/jpeg;base64," + imageData;
          break;
      }
    }, (err) => {
      console.log(err);
    });
  }

  next() {
    this.signupSlider.lockSwipes(false);
    this.signupSlider.slideNext();
    this.signupSlider.lockSwipes(true);
  }

  prev() {
    this.signupSlider.lockSwipes(false);
    this.signupSlider.slidePrev();
    this.signupSlider.lockSwipes(true);
  }

  save() {
    this.submitAttempt = true;
    if (!this.slideOneForm.valid) {
      this.signupSlider.lockSwipes(false);
      this.signupSlider.slideTo(0);
      this.signupSlider.lockSwipes(true);
    }
    else if (!this.slideTwoForm.valid) {
      this.signupSlider.lockSwipes(false);
      this.signupSlider.slideTo(1);
      this.signupSlider.lockSwipes(true);
    }
    else if (!this.slideThreeForm.valid) {

    }
    else {
      console.log("success!")
      console.log(this.slideOneForm.value);
      console.log(this.slideTwoForm.value);
      console.log(this.slideThreeForm.value);
    }
  }

}
