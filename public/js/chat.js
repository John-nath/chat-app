const socket = io();

        //Elements
        const $messageForm = document.querySelector('.submit')
        const $messageFormInput = $messageForm.querySelector('input')
        const $messageFormButton = $messageForm.querySelector('button')
        const $locationButton = document.querySelector('#send-location')
        const $messages = document.querySelector('#messages')
        

        //Templates
        const messageTemplate = document.querySelector('#message-template').innerHTML
        const locationTemplate = document.querySelector('#location-message-template').innerHTML
        const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

        //Options
        const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
        const autoscroll = ()=> {
            //New message elelment
            const $newMessage = $messages.lastElementChild

            //Height of new message
            const newMessageStyles = getComputedStyle($newMessage)
            const newMessageMargin = parseInt(newMessageStyles.marginBottom)
            const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

            //Visible Height
            const visibleHeight = $messages.offsetHeight

            // Height of messages container
            const containerHeight = $messages.scrollHeight

            //How far have I scrolled?
            const scrollOffset = $messages.scrollTop + visibleHeight

            if(containerHeight - newMessageHeight <= scrollOffset) {
                $messages.scrollTop = $messages.scrollHeight
            }



        }

        socket.on('locationMessage',(location)=> {
            console.log(location)
 
            const html= Mustache.render(locationTemplate, {
                username: location.username,
                location: location.url,
                createdAt: moment(location.createdAt).format('h:mm a')
            })
            $messages.insertAdjacentHTML('beforeend',html)

            autoscroll()

        })

        socket.on('message', (message) => {
            console.log(message) 

            const html= Mustache.render(messageTemplate, {
                user: message.username,
                message: message.text,
                createdAt: moment(message.createdAt).format('h:mm a')
            })
            $messages.insertAdjacentHTML('beforeend',html)
            autoscroll()
        })

        
        socket.on('sendMessage', (message)=> {
            console.log(message)
        })

       socket.on('roomData', ({room, users}) => {
            const html = Mustache.render(sidebarTemplate, {
                room,
                users
            })

            document.querySelector('#sidebar').innerHTML = html
       })

        

        $messageForm.addEventListener('submit', (e)=> {
            //disable 
            e.preventDefault()
            $messageFormButton.setAttribute('disabled', 'disabled')

            const message = document.querySelector('input').value
            socket.emit('sendMessage', message, (error)=>{
                //enable
                $messageFormButton.removeAttribute('disabled')
                $messageFormInput.value = ''
                $messageFormInput.focus()
                if(error) {
                    return console.log(error)
                }
                
                console.log('The message was delivered')
            })
        })

        $locationButton.addEventListener('click', ()=> {
            if(!navigator.geolocation) {
                return alert('Your browser does not support this service')
            }

            navigator.geolocation.getCurrentPosition((position)=> {
                
                
                $locationButton.setAttribute('disabled', 'disabled')
                const coordinates = {
                    longitude: position.coords.longitude,
                    latitude:   position.coords.latitude
                }

                socket.emit('sendLocation', coordinates, (locationMessage)=> {
                   $locationButton.removeAttribute('disabled')
                    console.log(locationMessage)
                } )
            })          
})

socket.emit('join', {username, room}, (error)=> {
    if(error) {
        alert(error)
        location.href='/'
    }
})