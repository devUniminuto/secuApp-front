<template>
  <div>
    <v-alert type="error" :value="alert" style="width:96%">
      ¡¡Se ha detectado un nuevo movimiento!!
    </v-alert>
    <FullBoxVue class="shadowHover">
      <h1>Habitación {{ infoFlujo.name }}</h1>

      <v-btn
        color="primary"
        @click="server_activarDesactivarCamara()"
        v-if="!infoFlujo.activeAlarm"
      >
        Activar Alarma
      </v-btn>
      <v-btn color="primary" @click="server_activarDesactivarCamara()" v-else>
        Desactivar Alarma
      </v-btn>
      <br /><br /><br />

      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" v-bind="attrs" v-on="on">
            Agregar forma de notificación
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Crear forma de notificación
          </v-card-title>

          <v-form>
            <v-container>
              <v-select
                :items="itemsTipos"
                v-model="tipo"
                label="Tipo"
              ></v-select>

              <v-text-field v-model="valor" label="valor"></v-text-field>
            </v-container>
          </v-form>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="createTypesNotifications()">
              Guardar
            </v-btn>
            <v-btn color="primary" text @click="dialog = false">
              Cancelar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-data-table
        :headers="headers"
        :items="chats"
        item-key="id"
        class="elevation-1"
        :search="search"
      >
        <template v-slot:top>
          <v-text-field
            v-model="search"
            label="Buscar"
            class="mx-4"
          ></v-text-field>
        </template>

        <template v-slot:body="{ items, headers }">
          <tbody>
            <tr v-for="(item, idx, k) in items" :key="idx">
              <td v-for="(header, key) in headers" :key="key">
                <v-edit-dialog
                  :return-value.sync="item[header.value]"
                  @save="save(item)"
                  save-text="Guardar"
                  @cancel="cancel"
                  cancel-text="Cancelar"
                  @open="open"
                  @close="close"
                  large
                >
                  {{ item[header.value] }}
                  <template v-slot:input>
                    <v-select
                      :items="itemsTipos"
                      v-model="item.type"
                      label="Tipo"
                    ></v-select>
                    <v-textarea v-model="item.value" label="Valor"></v-textarea>
                  </template>
                </v-edit-dialog>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </FullBoxVue>

    <FullBoxVue>
      <h1>Notificaciones de movimientos</h1>
      <v-data-table
        :headers="headersNotificaciones"
        :items="notificaciones"
        item-key="id"
        class="elevation-1"
        :search="search"
      >
        <template v-slot:body="{ items, headers }">
          <tbody>
            <tr v-for="(item, idx, k) in items" :key="idx">
              <td v-for="(header, key) in headers" :key="key">
                <v-edit-dialog
                  :return-value.sync="item[header.value]"
                  save-text=""
                  @cancel="cancel"
                  cancel-text="Cerrar"
                  @open="open"
                  @close="close"
                  large
                >
                  {{ item[header.value] }}
                  <template v-slot:input>
                    <img :src="item.image" alt="" srcset="" />
                  </template>
                </v-edit-dialog>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </FullBoxVue>

    <FullBoxVue class="shadowHover">
      <h1>Código de habitación</h1>
      <p>Ingresa el siguiente código</p>
      <v-text-field v-model="urlBot" readonly filled></v-text-field>
    </FullBoxVue>
  </div>
</template>

<script>
import FullBoxVue from "@/components/static/FullBox.vue";
import {
  getAllTypesMessages,
  createTypesNotifications,
  updateConversationalFlowMessage,
} from "@/api";

import * as io from "socket.io-client";

export default {
  data() {
    return {
      itemsTipos: ["Correo", "Número"],
      search: "",
      chats: [],
      notificaciones: [],
      headers: [
        {
          text: "Id Conversación",
          value: "id",
        },
        {
          text: "Tipo de comunicación",
          value: "type",
        },
        {
          text: "Valor",
          value: "value",
        },
      ],

      alert: false,

      headersNotificaciones: [
        {
          text: "Id",
          value: "id",
        },
        {
          text: "Fecha",
          value: "createdAt",
        },
        {
          text: "Imagen",
          value: "image",
        },
      ],
      dialog: false,
      tipo: "",
      valor: "",
      urlBot: "",
      answer: "",
      infoFlujo: {},
      showModal: false,
    };
  },

  methods: {
    actDescAlarma() {},

    getConversationalFlows() {
      getAllTypesMessages(this.$route.params.id).then(
        function (response) {
          let respuesta = response.data;
          this.chats = respuesta.typesMessages;
          this.infoFlujo = respuesta.infoRoom;
          this.urlBot = respuesta.infoRoom.id;
          this.notificaciones = respuesta.moves;
          this.makeConnectionWS();
        }.bind(this)
      );
    },

    createTypesNotifications() {
      createTypesNotifications({
        idRoom: this.infoFlujo.id,
        type: this.tipo,
        value: this.valor,
      }).then(
        function (response) {
          this.getConversationalFlows();
          this.tipo = "";
          this.type = "";
          this.dialog = false;
        }.bind(this)
      );
    },

    save(item) {
      updateConversationalFlowMessage(item).then(
        function (response) {
          this.getConversationalFlows();
          this.dialog = false;
        }.bind(this)
      );
    },
    cancel() {},
    open() {},
    close() {},

    receivedMsg(data) {
      console.log("Data response!");
    },

    newMovement(data) {
      console.log("Nuevo movimeinto")
      this.getConversationalFlows();
      this.alert = true;
      setTimeout(() => {
        this.alert = false;
      }, 5000);
    },

    openChat(idChat) {
      this.nombreChatSeleccionado = idChat;
      this.socket.emit("server:support_access", {
        idChat: idChat,
      });
    },

    server_activarDesactivarCamara() {
      console.log(this.infoFlujo.id);
      this.socket.emit("server_activarDesactivarCamara", {
        idChat: this.infoFlujo.id,
      });
      this.getConversationalFlows();
    },

    makeConnectionWS() {
      this.socket = io.connect("ws://localhost:9000/", {
        cors: {
          credentials: true,
        },
      });
      this.socket.emit("server_join_camera", { idChat: this.infoFlujo.id });
      this.socket.on("client:newMessageSupport", this.nuevoMensaje);
      this.socket.on("client_activatedesactivateCamera", this.receivedMsg);
      this.socket.on("client_movementDetected", this.newMovement);
    },
  },

  mounted: function () {
    this.getConversationalFlows();
  },

  components: {
    FullBoxVue,
  },
};
</script>

<style scoped>
div {
  width: 100%;
}
</style>
