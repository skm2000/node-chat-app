const socket = io()

/* socket.on('countUpdated', (count) => {
    console.log('The count has been updated',count)
})


document.querySelector('#increment').addEventListener('click', () =>{
    console.log('Clicked')

    socket.emit('increment')
}) */

$messageForm = document.querySelector('#message-form')
$messageFormInput = $messageForm.querySelector('input')
$messageFormButton = $messageForm.querySelector('button')
$messages = document.querySelector('#messages')
$sendLocationButton = document.querySelector('#share-location')
$sendImageButton = document.querySelector('#share-image')

// * templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sliderTemplate = document.querySelector('#slider-template').innerHTML
const imageTemplate = document.querySelector('#image-template').innerHTML


// * parsing
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    })
    messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage',(url) => {
    console.log(url)
    const link = Mustache.render(locationMessageTemplate, {
        username : url.username,
        url : url.url,
        createdAt: moment(url.createdAt).format('h:mm:ss a')
    })
    messages.insertAdjacentHTML('beforeend',link)
})

socket.on('roomData', ({room, users}) => {
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sliderTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value

    if(message.length == 0){
        return alert('No message typed!')
    }

    // * disable
    $messageFormButton.setAttribute('disabled','disabled')

    //* console.log(message)

    socket.emit('sendMessage',message, (error) => {

        // * enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error);
        }
        console.log("Message Delivered")
    })
})


$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        //* console.log(position)
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        socket.emit('shareLocation', {
            latitude : latitude,
            longitude : longitude
        }, (error) => {

            $sendLocationButton.removeAttribute('disabled')

            if(error){
                return console.log(error)
            }
                    
            console.log('Location Shared')
        })
    })
})



socket.emit('join', {username,room}, (error) => {
    if(error){
        alert(error),
        location.href = '/'
    }
})



let imageMessage;
$sendImageButton.addEventListener('click', () => {
    document.getElementById('output').src='';
    socket.emit('sendImage',imageMessage,(error) => {
        console.log('Image Sent',error)
    });
})


function handleFile(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = function () {
        imageMessage = reader.result;
        console.log(imageMessage);
    };
    reader.readAsDataURL(file);
    document.getElementById("output").src = URL.createObjectURL(file);
}

socket.on('image',({username,image,createdAt})=>{
    const html = Mustache.render(imageTemplate,{
        username : username,
        image: image,
        createdAt: moment(createdAt).format('h:mm:ss a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    // const imaegShow=document.createElement('img');
    // imaegShow.style.width="50";
    // imaegShow.style.height="50";
    // imaegShow.setAttribute('src',image);
    // const html = Mustache.render(messageTemplate,{
    //     username : username,
    //     message: '<img style={{width=50,height=50}} src={{'+image+'}}/>',
    //     createdAt: moment(createdAt).format('h:mm:ss a')
    // })
    // messages.insertAdjacentHTML('beforeend',html)
    // console.log("received image");
    // document.getElementById('showreturned').setAttribute('src',image)
    // const imageDiv= document.createElement('div');
    // imageDiv.setAttribute('class',"image");
    // const imagep=document.createElement('p');
    // const spanUser = document.createElement('span');
    // spanUser.setAttribute('class','message__name');
    // spanUser.innerText=username;
    // const spanTime = document.createElement('span');
    // spanTime.setAttribute('class','message__meta');
    // spanTime.innerText=moment(createdAt).format('h:mm:ss a');
    // imagep.appendChild(spanUser);
    // imagep.appendChild(spanTime);
    // const imageShowp=document.createElement('p');
    // const imaegShow=document.createElement('img');
    // imaegShow.style.width="50";
    // imaegShow.style.height="50";
    // imaegShow.setAttribute('src',image);
    // imageShowp.appendChild(imaegShow);
    // imageDiv.appendChild(imageShowp);
    // document.getElementById('chat-container').appendChild(imageDiv);
})


