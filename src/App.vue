<template>
  <div id="app">
    <v-container>
      <v-layout align-center justify-center>
        <v-flex xs12>
         <v-card color="#549EFF">
           <v-card-text >
             <div class="text-md-center title-header" text-lg-center>
               Collabrative Document editor
             </div> 
           </v-card-text>
         </v-card>
        </v-flex>
      </v-layout>
      <v-layout align-baseline class="top-margin">
        <v-flex offset-xs2 xs6>
          <v-text-field label="UserName" v-model="username" placeholder="Please enter a username to start editing"></v-text-field>
        </v-flex>
        <v-flex offset-xs1 xs3>
          <v-btn @click="userValidity" color="">Enter</v-btn>
        </v-flex>
      </v-layout>
      <editor  v-if="validUser" :username="this.username" />
      <v-snackbar
      v-model="snackbar"
      :timeout="timeout"
      :bottom="y === 'bottom'"
      :left="x === 'left'"
      :right="x === 'right'"
      :top="y === 'top'"
      >
      {{text}}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import Editor from "./components/Editor.vue";
import io from "socket.io-client";
import axios from "axios";

export default {
  name: "app",
  components: {
    Editor
  },
  data() {
    return {
      username: "",
      validUser: false,
      value: "",
      snackbar:false,
      y: 'top',
      x: 'right',
      timeout:6000,
      text:'',
      sockets: io.connect("http://localhost:5000")
    };
  },
  mounted(){
    this.sockets.on("released", () => {
      this.text = 'Now you can start editing';
      this.snackbar = true;
    });
  },
  methods: {
    userValidity() {
      if (this.username !== "") {
        axios
          .post("http://localhost:5000/adduser", { username: this.username })
          .then(res => {
            res.status == 200 ? (this.validUser = true) : "";
          })
          .catch(err => {
            this.text = 'User name already in use';
            this.snackbar = true;
            console.log(err);
          });
      }
    }
  }
};
</script>

<style>
.title-header{
  color: #ffffff;
  font-size: 20px;
  font-weight: bolder;
}
.top-margin{
  margin-top: 5%;
}
</style>