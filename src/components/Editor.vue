<template>
 <v-container>
   <v-layout>
     <v-flex>
       <v-card color="#f4f8fb">
      <v-card-title>
        <div class="editor-title">Editor</div>
      </v-card-title>
    </v-card>
    <div>
        <v-textarea 
        outline
        auto-grow
        v-model="editorContent"
        @focus="checklock"
        @blur="releaseLock"
        :disabled="readOnly"
        >
        </v-textarea>
      </div>
     </v-flex>
   </v-layout>
 </v-container>
</template>

<script>
import io from "socket.io-client";
import axios from "axios";

export default {
  name: "Editor",
  props: {
    username: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      editorContent: "",
      readOnly: false,
      sockets: io.connect("http://localhost:5000")
    };
  },
  beforeMount() {
    let url = "http://localhost:5000/getdata";
    axios
      .get(url)
      .then(data => {
        this.editorContent = data.data.content;
      })
      .catch(error => {
        console.log("something went wrong", error);
      });
  },
  mounted() {
    this.sockets.on("lockgranted", data => {
      data.user == this.username
        ? (this.readOnly = false)
        : (this.readOnly = true);
    });
    this.sockets.on("released", () => {
      this.readOnly = false;
    });
    this.sockets.on("newContent", data => {
      console.log("new data", data);
      if (this.username !== data.author) {
        this.editorContent = data.data;
      }
    });
  },
  watch: {
    editorContent(value) {
      if (!this.readOnly) {
        this.sockets.emit("newdata", { data: this.editorContent });
      }
    }
  },
  methods: {
    checklock() {
      let url = "http://localhost:5000/requestlock?name=" + this.username;
      axios
        .get(url)
        .then(res => {
          res.data === "granted" || res.data === this.username
            ? (this.readOnly = false)
            : (this.readOnly = true);
        })
        .catch(error => {
          console.log("error", error);
        });
    },
    releaseLock() {
      this.sockets.emit("release", { user: this.username });
    }
  }
};
</script>

<style>
.editor-title{
  font-size: 16px;
  font-weight: bold;
  color: #55626c;
}
</style>
