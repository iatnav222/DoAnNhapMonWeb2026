var userData = {
    "name":"Nguyễn Văn A",
    "age":30,
    "email": "nguyenvana@gmail.com",
    "address":{
        "city":"Ho Chi Minh",
        "state":"NY",
        "zipcode":"10001"
    }
}

function displayUserInfo(data){
    var userInfoElement = document.getElementById('userInfo');
    userInfoElement.innerHTML =`
        <p><strong>Name: </strong> ${data.name} </p>
        <p><strong>Age: </strong> ${data.age} </p>
        <p><strong>Email: </strong> ${data.email} </p>
        <p><strong>Address: </strong> ${data.address.city} </p>
    `
}

displayUserInfo(userData)
