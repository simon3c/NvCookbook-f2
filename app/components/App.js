var SpeechRecognition = require("nativescript-speech-recognition").SpeechRecognition;
var SpeechRecognitionTranscription = require("nativescript-speech-recognition").SpeechRecognitionTranscription;
var SpeechRecognitionOptions = require("nativescript-speech-recognition").SpeechRecognitionOptions;

var TNSTextToSpeech = require("nativescript-texttospeech").TNSTextToSpeech;
var SpeakOptions = require("nativescript-texttospeech").SpeakOptions;

/* import {
  SpeechRecognition,
  SpeechRecognitionTranscription,
  SpeechRecognitionOptions
} from "nativescript-speech-recognition";
import { TNSTextToSpeech, SpeakOptions } from "nativescript-texttospeech"; */

var permissions = require( "nativescript-permissions" );
var speechRecognition = new SpeechRecognition();
var TTS = new TNSTextToSpeech();

module.exports = {
    template: `
      <Page class="page">
        <ActionBar class="action-bar" title="Cookbook"/>

        <StackLayout>
        <ListView for="content in contents">
            <v-template>
            <Label :text="content.message" class="title" textAlignment="center" />
            </v-template>
        </ListView>
        <Button class="btn btn-primary" @tap="startListening">Start Listening</Button>
        <Button class="btn btn-primary" @tap="stopListening">Stop Listening</Button>

        <Button class="btn btn-primary" @tap="readContent">Read Content</Button>
        <ActivityIndicator :busy="isListening" />
        <Label :text="transcription" class="title" textAlignment="center" />
        </StackLayout>

      </Page>
    `,
    data() {
      return {
        counter: 0,
        isListening: false,
        isSpeaking: false,
        transcription: "",
        option: "",
        contents: [
            { message: "Welcome to Chef's Kitchen!" },
            { message: "What do you want to check out today?" },
            { message: "Recipes? or Cooking Tips?" }
        ],
        speakOptions: {
            text: "", /// *** required ***
            speakRate: 0.5, // optional - default is 1.0
            pitch: 1.0, // optional - default is 1.0
            volume: 1.0, // optional - default is 1.0
            locale: "en-US", // optional - default is system locale,
            finishedCallback: this.finishedSpeaking // optional
        }
      };
    },
    mounted() {
      console.log("Mounted successfully.");
      /* speechRecognition.requestPermission()
        .then(function (granted) {
        if (!granted) {
          alert("It seems that you haven't enabled the microphone. Please visit your app settings and let this app listen to your voice!");
        }
      }); */
    },
    created() {
      console.log("Page created...");
      this.init();
    },
    methods: {
        init() {
          console.log("Page initialized.");
          /* permissions.requestPermissions(android.Manifest.permission.RECORD_AUDIO, "I need these permissions because I'm cool")
            .then(function () {
              console.log("Got Permission to Record Audio!");
            })
            .catch(function () {
              console.log("No permission to Record Audio :(");
            }); */
          speechRecognition.available().then(function(available) {
            console.log(available ? "YES!" : "NO");
          });
    
          this.readContent();
        },
        startListening() {
          if(this.isListening || this.isSpeaking) return;
          this.isListening = true;
          
          console.log("Started Listening.");
          speechRecognition.requestPermission().then(granted => {
            if (!granted) {
              alert("It seems that you haven't enabled the microphone. Please visit your app settings and let this app listen to your voice!");
              console.log("No Permissions available...");
              this.isListening = false;
    
            } else {
              this.isListening = true;
              speechRecognition
                .startListening({
                  onResult: transcription => {
                    this.transcription = transcription.text;
                    this.option = transcription.text;
                    this.isListening = false;
                    this.readContent();
                  },
                  returnPartialResults: true,
                  locale: "en-US"
                })
                .then(
                  started => {},
                  errorMessage => {
                    console.log(
                      `Error while trying to start listening: ${errorMessage}`
                    );
                    this.isListening = false;
                  }
                );
            }
          });
        },
        stopListening() {
          this.isListening = false;
          console.log("Stopped Listening.");
          speechRecognition.stopListening().then(
            () => {
              console.log("Stopped listening......");
            },
            errorMessage => {
              console.log("Stop error: " + errorMessage);
            }
          );
        },
        readContent() {
          if(this.isListening) return;
    
          var message = "";
    
          if(this.option.length > 0) {
            if(this.option.toUpperCase().trim() == "Recipes".toUpperCase()) {
              message = "You have selected Recipes."
            } else if (this.option.toUpperCase().trim() == "Cooking Tips".toUpperCase()) {
              message = "You have selected Cooking Tips."
            } else {
              message = "Sorry I don't have that option available for you."
            }
    
          } else if(this.contents.length) {
            for (var i = 0, len = this.contents.length; i<len; i++) {
              message += this.contents[i].message + ". ";
            }
          } else {
            console.log("Returning.");
            return;
          }
            
          console.log("Reading content: " + message);
          this.isSpeaking = true;
          this.speakOptions.text = message;
          TTS.speak(this.speakOptions).then(
            () => {
              console.log("Speaking......");
            },
            err => {
              console.log("Error in Speaaakkkkinnggg");
            }
          );
          console.log("End of readContent method...");
        },
        finishedSpeaking() {
          console.log("Completed speaking...");
          this.isSpeaking = false;
          if(this.option.length < 1) {
            this.startListening();
          } else {
            this.transcription = "";
            this.option = "";
          }
        }
      },
  };