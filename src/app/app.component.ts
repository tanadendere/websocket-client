import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private isBrowser: boolean;

  socket: WebSocket | undefined;
  numOfUsers = 0; //UI

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // this.socket = new WebSocket('ws://localhost:3000/chat');
      this.socket = new WebSocket('ws://localhost:4000');
      if (this.socket) {
        // this.socket.binaryType = "arraybuffer";

        this.socket.addEventListener('message', (e) => {
          // Data sent will be a string so parse into an object
          const event = JSON.parse(e.data);

          // Server sets a type for each message
          switch (event.type) {
            case 'MESSAGES_ADD':
              this.addMessage(event.data);
              break;
            case 'MESSAGES_SET':
              this.setMessages(event.data);
              break;
            case 'USERS_ADD':
              this.addUser(event.data);
              break;
            case 'USERS_REMOVE':
              this.removeUser(event.data);
              break;
            case 'USERS_SET':
              this.setUsers(event.data);
              break;
          }
        });

        const formEl = document.getElementById('form');
        const input = document.getElementById('input') as HTMLInputElement;

        formEl?.addEventListener('submit', (event) => {
          // Prevent from submitting page
          event.preventDefault();

          // Send the message text

          this.socket?.send(
            JSON.stringify({
              text: input.value,
            })
          );
          // this.socket?.send('testing something');

          // Clear the input
          input.value = '';
        });
      }
    }
  }

  addMessage(message: IMessage) {
    // Create an element for message
    // <div class="chat chat-start">
    //   <div class="chat-header">
    //      Obi-Wan Kenobi
    //      <time class="text-xs opacity-50">2 hours ago</time>
    //    </div>
    //    <div class="chat-bubble">You were the Chosen One!</div>
    // </div>

    const el = document.createElement('h3');
    const messagesEl = document.getElementById('messages') as HTMLDivElement;

    // Set text of element to be message
    if (message.username == undefined) {
      //       <div class="toast toast-center toast-middle">
      //          <div class="alert alert-info">
      //            <span>New mail arrived.</span>
      //          </div>
      //        </div>
      // const notificationEl = document.createElement('div');
      // notificationEl.classList.add('toast');
      // notificationEl.classList.add('toast-center');
      // notificationEl.classList.add('toast-middle');

      const notificationEl = document.createElement('div');
      notificationEl.classList.add('alert');
      notificationEl.classList.add('alert-info');
      notificationEl.classList.add('text-sm');
      notificationEl.classList.add('p-1');
      notificationEl.classList.add('m-1');
      notificationEl.classList.add('w-2/3');
      notificationEl.classList.add('self-center');

      const notificationTextEl = document.createElement('span');
      notificationTextEl.innerText = message.text;
      notificationEl.appendChild(notificationTextEl);

      // el.appendChild(document.createTextNode(message.text));
      messagesEl.appendChild(notificationEl);
    } else {
      const chatBubbleEl = document.createElement('div');
      chatBubbleEl.classList.add('chat');
      chatBubbleEl.classList.add('chat-start');

      const chatBubbleHeader = document.createElement('div');
      chatBubbleHeader.classList.add('chat-header');
      chatBubbleHeader.innerText = message.username;

      const date = new Date(message.timestamp);
      const time = `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      console.log(time);
      const timeEl = document.createElement('time');
      timeEl.innerText = time;

      chatBubbleHeader.appendChild(timeEl);

      const chatText = document.createElement('div');
      chatText.classList.add('chat-bubble');
      chatText.innerText = message.text;

      chatBubbleEl.appendChild(chatBubbleHeader);
      chatBubbleEl.appendChild(chatText);

      messagesEl.appendChild(chatBubbleEl);
    }

    // Scroll to bottom of messages element
    messagesEl.scrollTo(0, messagesEl.scrollHeight);
  }

  notifyChat(message: IMessage) {
    // Create an element for message
    const el = document.createElement('div');

    // Set text of element to be message
    el.appendChild(
      document.createTextNode(message.username + ' ' + message.text)
    );

    // Scroll to bottom of messages element
    const messagesEl = document.getElementById('messages') as HTMLDivElement;
    messagesEl.appendChild(el);
    messagesEl.scrollTo(0, messagesEl.scrollHeight);
  }

  setMessages(messages: IMessage[]) {
    // Clear messages
    const messagesEl = document.getElementById('messages') as HTMLDivElement;
    messagesEl.innerHTML = '';
    // Loop through and add each message
    messages.forEach((message) => this.addMessage(message));
  }

  addUser(username: string) {
    // Create an element for username
    const el = document.createElement('li');

    // Set id of element for easy remove
    el.setAttribute('id', username);

    el.appendChild(document.createTextNode(username));
    const usersEl = document.getElementById('users') as HTMLDivElement;
    usersEl.appendChild(el);
  }

  removeUser(username: string) {
    const userEl = document.getElementById(username) as HTMLHeadingElement;
    userEl.outerHTML = '';
  }

  setUsers(usernames: string[]) {
    // Clear usernames
    const usersEL = document.getElementById('users') as HTMLDivElement;
    usersEL.innerHTML = '';
    // Loop through and add each username
    usernames.forEach((username) => {
      this.numOfUsers += 1; //UI
      this.addUser(username);
    });
  }
}
export interface IUser {
  username: string;
}

export interface IMessage {
  text: string;
  username: string;
  timestamp: number;
}

// export class AppComponent implements OnInit {
//   private isBrowser: boolean;

//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//   }

//   ngOnInit() {
//     if (this.isBrowser) {
//       const myWebSocket = new WebSocket('ws://localhost:3000');

//       myWebSocket.addEventListener('open', (event) => {
//         console.log('connected to the server');

//         // myWebSocket.send('whats the time');
//       });
//       myWebSocket.addEventListener('close', (event) => {
//         console.log('disconnected to the server');
//       });
//       myWebSocket.addEventListener('message', (event) => {
//         console.log(`${event.data}`);
//         const messages = document.getElementById('messages');
//         const item = document.createElement('li');
//         item.textContent = event.data;
//         messages?.appendChild(item);
//       });

//       const form = document.getElementById('form');
//       const input = document.getElementById('input') as HTMLInputElement;

//       form?.addEventListener('submit', (e) => {
//         e.preventDefault();
//         if (input?.value) {
//           myWebSocket.send(input.value);
//           input.value = '';
//         }
//       });
//     }
//   }
// }

// title = 'websocket-client';

// // socket: Socket = io('http://localhost:3000');
// // myWebSocket = new WebSocket('ws:http://localhost:3000');

// constructor() {
//   // this.socket.on('open', () => {
//   //   console.log('Connect to the server');
//   // });
//   const myWebSocket = new WebSocket('ws://localhost:3000');
//   myWebSocket.addEventListener('open', (e) => {
//     console.log('connect to the server');
//   });
// }

// componentDidMount(){

// }

// messageInput = new FormControl('');

// // messages = document.getElementById('messages');

// onSubmit(): void {
//   if (this.messageInput.value) {
//     this.socket.emit('chat message', this.messageInput.value);
//     this.messageInput.setValue('');
//   }

//   this.socket.on('chat message', (msg: string) => {
//     const item = document.createElement('li');
//     item.textContent = msg;
//     // if (this.messages) {
//     //   this.messages.appendChild(item);
//     // }
//     window.scrollTo(0, document.body.scrollHeight);
//   });
// }
// }
