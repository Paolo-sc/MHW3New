//Keys and endpoints
const client_id = '';
const client_secret = '';
const ebay_token_endpoint = 'https://corsproxy.paolosc.workers.dev/corsproxy/?apiurl=https://api.ebay.com/identity/v1/oauth2/token';
const ebay_endpoint = 'https://api.ebay.com/buy/browse/v1/';

var token_data; //variabile in cui memorizziamo il token restituito dal server

function onTokenResponse(response){
    return response.json();
}

function getToken(json){
    token_data = json;
}

function onResponse(response){
    return response.json();
}

function onProduct(json){
    const results = json.itemSummaries;
    const modale = document.querySelector('#modale');
    const section = document.createElement('section');
    let new_div;
    let new_img;
    let new_a;
    let new_p;

    if(json.total == 0){
        const errore = document.createElement('h1');
        errore.textContent = 'Nessun risultato trovato!';
        new_div = document.createElement('div');
        new_div.appendChild(errore);
        section.appendChild(new_div);
        modale.appendChild(section);
        return;
    }
    for(result of results){
        new_div = document.createElement('div');
        new_img = document.createElement('img');
        new_a = document.createElement('a');
        new_p = document.createElement('p');
        new_a.textContent = result.title;
        new_a.href = result.itemWebUrl;
        new_a.target = '_blank';
        new_img.src = result.image.imageUrl;
        new_p.textContent = result.price.value + ' ' + result.price.currency;
        new_div.appendChild(new_img);
        new_div.appendChild(new_a);
        new_div.appendChild(new_p);
        section.appendChild(new_div);
    }
    modale.appendChild(section);
}

fetch(ebay_token_endpoint,
    {
        method: 'POST',
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
        headers:
        {
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
            'Content-type' : 'application/x-www-form-urlencoded',
        }
    }).then(onTokenResponse).then(getToken);

function configureItems(){
    const products = document.querySelector('#products');
    let new_div;
    let new_h1;
    let star;
    let new_img;
    let new_h2;
    let new_p;
    let new_ebay;
    const input_box = document.querySelector('#sbar').querySelector('input');
    input_box.addEventListener('keyup',searchItem);


    for(element of contents){
        new_div = document.createElement('div');
        new_h1 = document.createElement('h1');
        star = document.createElement('img');
        new_img = document.createElement('img');
        new_h2 = document.createElement('h2');
        new_p = document.createElement('p');
        new_ebay= document.createElement('img');

        new_h1.textContent = element.name;
        star.classList.add('star');
        star.src = 'images/star.png';
        star.addEventListener("click",addPrefs);
        new_img.classList.add('contents');
        new_img.src = element.image;
        new_h2.textContent = element.descr;
        new_p.textContent = 'Clicca per piu dettagli';
        new_p.addEventListener("click",showDetails);
        new_ebay.src= 'images/ebay.png';
        new_ebay.classList.add('ebay');
        new_ebay.addEventListener("click",modalOn);

        new_div.appendChild(new_h1);
        new_div.appendChild(star);
        new_div.appendChild(new_img);
        new_div.appendChild(new_h2);
        new_div.appendChild(new_p);
        new_div.appendChild(new_ebay);
        products.appendChild(new_div);
    }
}

function modalOn(event){
    const par_div = event.currentTarget.parentNode;
    const title = par_div.querySelector('h1').textContent;
    let limit = 5;
    if(screen.width >=2560)
        limit = 7;
    const request = ebay_endpoint + 'item_summary/search?q='+ title + '&limit=' + limit;
    fetch(request,
        {
            headers:
            {
                'Authorization': 'Bearer ' + token_data.access_token,
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_IT'
            }
        }).then(onResponse).then(onProduct);

    modale.classList.remove('hide');
    document.body.classList.add('no-scroll');
}

function chiudiModale(event){
    if(event.key === 'Escape'){
        const modale = document.querySelector('#modale');
        if(!modale.classList.contains('hide')){
            modale.classList.add('hide');
            document.body.classList.remove('no-scroll');
            modale.innerHTML = '';
        }
    }
}

function showDetails(event){
    const div = event.currentTarget.parentNode;
    const h2_class = div.querySelector('h2').classList;
    if(h2_class!='visible'){
        h2_class.add('visible');
        event.currentTarget.textContent = 'Meno Dettagli';
    }
    else{
        h2_class.remove('visible');
        event.currentTarget.textContent = 'Clicca per piu dettagli';
    }
}

function removePrefs(event){
    const par_div = event.currentTarget.parentNode;
    const pref_box = document.querySelector('#prefs_box');
    par_div.remove();
    if(!pref_box.querySelectorAll('div').length)
        document.querySelector('#prefs').classList.remove('visible');
}

function addPrefs(event){
    const par_div = event.currentTarget.parentNode;
    const pref_box = document.querySelector('#prefs_box');

    for(let element of pref_box.querySelectorAll('div'))
        if(element.querySelector('h1').textContent==par_div.querySelector('h1').textContent)
            return;
            
    /*METODO CON CREATEELEMENT
    const innHtml = par_div.innerHTML;
    const new_div = document.createElement('div');
    new_div.innerHTML = innHtml;*/

    const new_div = par_div.cloneNode(true);
    const clas = document.querySelector('#prefs').classList;

    new_div.querySelector('h2').remove();
    new_div.querySelector('p').remove();
    new_div.querySelector('.star').src='images/fullstar.png';
    new_div.querySelector('.star').addEventListener('click',removePrefs);
    new_div.querySelector('.ebay').addEventListener('click',modalOn);
    pref_box.appendChild(new_div);

    if(!clas.contains('visible'))
        clas.add('visible');
}

function searchItem(){
    const divs = document.querySelector('#products').querySelectorAll('div');
    let input = document.querySelector('#sbar').querySelector('input');
    let my_input = input.value.toUpperCase();
    let my_text;

    for(element of divs){
        my_text = element.querySelector('h1').textContent;
        if(my_text.toUpperCase().indexOf(my_input) > -1){
            element.classList.remove('hide');
        }
        else
            element.classList.add('hide');
    }
}

//Aggiungo l'eventListener per chiudere la modale
window.addEventListener('keydown',chiudiModale);

configureItems();