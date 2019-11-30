/**
 * author: Baris
 * functionality: 
 *  1. updates the functionality of the main page- the editor. 
 *  2. gets the lines selected, created an error, allows you to change the reason
 *  3. check the good answers, the hints, and your score
 */

// INITIAL SETUP
// define variables
var originalDom;
var listInner;
var firebase_db; // database from firebase

// initialize 
originalDom = document.querySelector('.marketing-content-hidden');
//listInner = document.querySelector('.marketing-content-list').innerHTML;
firebase_db = firebase.database();


message = `<p>&nbsp;</p>
<h2 style="text-align: center;"><strong>Te ndihmojme familjet e prekura nga termeti me nje banese te perkohshme.&nbsp;</strong></h2>
<br />
<h3><em> Mund te regjistroheni si <strong>(Mund te ndihmoj te pakten nje familje)</strong> ose si <strong>(Kam nevoje per banese te perkohshme)</strong> nen faqen Banese e perkohshme.<br />
Ju lutem hidhni te dhena te sakta ne menyre qe te mos kete keqkuptime.&nbsp;<br />
Nese bete nje gabim ne hedhjen e te dhenave,&nbsp;<span style="text-decoration: underline;">mund ti shkruani nga fillimi.</span> 
Vetem hedhja juaj e fundit do te ndahet me te tjeret.</em></h3>
<br />
<h3>Nese jeni nje&nbsp;<strong>ndihmues </strong>(keni mundesi te prisni per pak kohe nje familje tjeter ne shtepine tuaj):&nbsp;</h3>
<ol>
<li>
<h3>Nese nuk doni te ndani te dhenat tuaja, ju lutem shkoni ne listen e ndihme-kerkuesve dhe pranoni nje nga familjet - mund ti kontaktoni privatisht.&nbsp;</h3>
</li>
<li><h3>Hidhni te dhenat tuaja nese keni mundesi te prisni edhe qofte nje person - familjet mund te dergojne vetem femijet per pak kohe.&nbsp;</h3>
</li>
<li>
<h3>Numri i juaj i telefonit nuk do te ndahet me te prekurit, prandaj nuk do te nderpriteni.&nbsp;</h3>
</li>
<li>
<h3>Ofroni nje strehe edhe per nje numer te vogel ditesh nese mundeni.&nbsp;&nbsp;</h3>
</li>
</ol>
<h3>&nbsp;</h3>

<h3>Nese jeni nje&nbsp;<strong>ndihme-kerkues </strong>(shtepia juaj eshte demtuar nga termeti, dhe nuk eshte me e banueshme):&nbsp;</h3>
<ol>
<li>
<h3>Kerkoni per te aferm apo per njerez afer baneses tuaj ne listen e ndihmuesve.&nbsp;</h3>
</li>
<li>
<h3>Kjo faqe nuk garanton qe do te gjejme nje shtepi, por do bejme me sa kemi mundesi tju jemi afer ne keto dite te veshtira.&nbsp;</h3>
</li>
</ol>
<br />
<h3> Nese nuk doni qe informacionet tuaja te duken me ne kete faqe, ju lutem regjistrohuni me te gjitha fushat bosh. </h3>
<br />

<h3><strong>Ky aplikacion nuk garanton identitetin e pjesmarresve. Ju lutem konfirmoni personalisht.</strong> </h3>
`
// need to stop when the exercise data loads
function loader() {
    var myVar = setTimeout(showPage, 2000);
}

function showPage() {
    document.getElementById("loader").style.display = "none";
}



//--------------------------------------------------------------------------------------------
/**
 * INITIALIZE FROM DATABASE
 * get data from firebase, 
 * update editor text, narrative text( description)
 * update exercises from db
 */

// connect to database, get exercises

// CALL FUNCTIONS
appendMessage();
appendCategory();

function appendMessage() {

    // update the text in the fields by calling the "id" element
    editor = document.getElementById("message");
    editor.innerHTML = message;
    //editor.style.display = "block";
    // css for the editor
    //editor = ace.edit("editor");
}


// create Checklist
function appendCategory() {

    ['ndihme-kerkues','ndihmues'].forEach( function( category){
    firebase_db.ref(category).once("value", gotDataNK, errDataNK)
    // function to show what to do with the data when the data has been taken
    function gotDataNK(data) {
        // get data from database
        var all_users = data.val();
        var user_ids = Object.keys(all_users);

        // create table and body of table
        var tbl = document.createElement('table');
        var tbdy = document.createElement('tbody');
        var tr, td;
        // ndihme-kerkues
        var columns = ['adresa', 'emer', 'sa persona', 'shenime', 'sociale','telefon', 'kohe'];
        var cols = ['address','name', 'no_people','notes','social','telephone','time'];
        // ndihmues
        if(category == 'ndihmues'){
            columns = ['adresa', 'emer', 'sa persona', 'shenime', 'sociale', 'kohe'];
            cols = ['address','name', 'no_people','notes','social','time'];
        }


        var width = document.getElementById(category+"-panel").offsetWidth/columns.length;
        tr = document.createElement('tr');
        for (var j=0; j< columns.length; j++){
            td = document.createElement('td');
            td.appendChild(document.createTextNode( columns[j]));
            tr.appendChild(td);
        }
        tbdy.appendChild(tr);

        // add the elements to each
        for (var i = 0; i < user_ids.length; i++) {
            
            // get submissions for this user
            var subs = Object.keys(all_users[ user_ids[i]]);
            // my only submission will be my last submission
            var my_subs = all_users[ user_ids[i]][subs[subs.length-1]]
            // these are my areas
            var s_keys = Object.keys(my_subs);
            s_keys.pop();

            tr = document.createElement('tr');
            for(var j=0; j<s_keys.length ; j ++){
                console.log(s_keys[j]);
                if ( cols.includes(s_keys[j])){
                    
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode( ""+my_subs[ s_keys[j]]));
                    td.style.width= width;
                    tr.appendChild(td);
                }
            }
            tbdy.appendChild(tr);
        }

        tbl.appendChild(tbdy);
        // get panel
        //$('#checklist-panel').append(tbl);
        document.getElementById(category+"-panel").append(tbl);

        //document.getElementById('editor').append(tbl);

        }
        // when there is an error from reading from the database
        function errDataNK(err) {
            console.log("Error");
            alert("Nisu dhe nje here nga fillimi te lutem.")

            window.location.href = "/index.html";
        }
    });
}

document.getElementById('selector').addEventListener('click', updateForm);
function updateForm(){
    if (selector.value === '1') {
        document.getElementById('address').placeholder="Adresa";
        document.getElementById('no_people').placeholder="Numri i personava nga nje familje qe mund te pranoni?";
        document.getElementById('time').placeholder="Per sa kohe mund te mirepritni nje familje?";
    }
    else if (selector.value === '2') {
        document.getElementById('address').placeholder="Ku jetonit me perpara ose ku do ishte ne rregull te jetoni perkohesisht?";
        document.getElementById('no_people').placeholder="Sa persona jeni? Shkruani ne shenime per raste te vecanta.";
        document.getElementById('time').placeholder="Per sa kohe mund te gjeni nje mundesi tjeter vendbanimi?";
    }

}
//--------------------------------------------------------------------------------------------
// TIMING
// Initialize library and start tracking time
// Important: after load from firebase.
TimeMe.initialize({
    currentPageName: "play", // current page
    idleTimeoutInSeconds: 600 // seconds
});

//--------------------------------------------------------------------------------------------
/**
 * SUBMISSION 
 */
// submission button functionality
document.getElementById('submitButton').addEventListener('click', submitSelection, false);
function submitSelection(e) {
    e.preventDefault(); // stop from reloading

    // authenticate user
    var userId = firebase.auth().currentUser.uid;
    var data = document.getElementsByClassName("f_values");
    var selector = document.getElementById('selector');

    // data extracted from the form
    var upload = {};
    for (var i = 0; i < data.length; i++) {
        upload[data[i].id] = data[i].value;
        data[i].value= ""
    }
    upload['timespent'] = TimeMe.getTimeOnCurrentPageInSeconds();

    if (selector.value === '1') {
        var newPostRef = firebase_db.ref('ndihmues/' + userId).push();
        newPostRef.set(upload);
        alert("Informacioni u shtua si Ndihmues. Rifreskoni faqen qe te shikoni rezultatet.")
    }
    else if (selector.value === '2') {
        var newPostRef = firebase_db.ref('ndihme-kerkues/' + userId).push();
        newPostRef.set(upload);
        alert("Informacioni u shtua si Ndihme-kerkues. Rifreskoni faqen qe te shikoni rezultatet.")
    }
    else{
        alert("Situata duket problematike.Ju lutem kontrolloni informacionin qe futet.")
    }
}

/**
 * Add materials button
 */
// submission button functionality
document.getElementById('addMaterialButton').addEventListener('click', submitMaterial, false);
function submitMaterial(e) {
    e.preventDefault(); // stop from reloading

    // authenticate user
    var userId = firebase.auth().currentUser.uid;
    var data = document.getElementsByClassName("m_values");

    // data extracted from the form
    var upload = {};
    for (var i = 0; i < data.length; i++) {
        upload[data[i].id] = data[i].value;
        data[i].value = "";
    }
    upload['timespent'] = TimeMe.getTimeOnCurrentPageInSeconds();
    upload['id'] = userId;

    // update database
    var newPostRef = firebase_db.ref('materiale/' + userId).push();
    newPostRef.set(upload);
    alert("Materialet per familjaret u shtuan. Rifresko faqen per te pare rezultatet.")
}

// create Checklist
function appendMaterials() {
    category = 'materiale';
    firebase_db.ref(category).once("value", gotDataM, errDataM)
    
    // function to show what to do with the data when the data has been taken
    function gotDataM(data) {
        // get data from database
        var materials = Object.values(data.val());

        // create table and body of table
        var tbl = document.createElement('table');
        var tbdy = document.createElement('tbody');
        var tr, td;
        // ndihme-kerkues
        var columns = ['adresa', 'sasia', 'telefon','lloji'];
        var cols = ['m_address', 'm_quantity', 'm_telephone', 'm_type'];
        var width = document.getElementById("shared-panel").offsetWidth/columns.length;
        tr = document.createElement('tr');
        for (var j=0; j< columns.length; j++){
            td = document.createElement('td');
            td.appendChild(document.createTextNode( columns[j]));
            tr.appendChild(td);
        }
        tbdy.appendChild(tr);

        // add the elements to each
        for (var i = 0; i < materials.length; i++) {
            
            // get all materials this user has put
            // allow only last values
            var mats = Object.values( materials[i]);

            var one_material = mats[mats.length-1];
            var s_keys = Object.keys(one_material);
            tr = document.createElement('tr');
            // for each material
            for(var j=0; j< s_keys.length ; j ++){
                if ( cols.includes(s_keys[j])){ 
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode( ""+ one_material[s_keys[j]]));
                    td.style.width= width;
                    tr.appendChild(td);
                }
            }
            tbdy.appendChild(tr);
        }
        tbl.appendChild(tbdy);
        document.getElementById("shared-panel").append(tbl);
        }

        // when there is an error from reading from the database
        function errDataM(err) {

            console.log(err)
            alert("Nisu dhe nje here nga fillimi te lutem.")
            window.location.href = "/index.html";
        }
}
appendMaterials();