/**
 * author: Doren
 * functionality: 
 *  1. Updates the tabs
 *  2. Processes inputs
 */

// DEFINE VARIABLES FOR LATER USAGE (KIC=KeepItClean)
// database related
var firebase_db; // database from firebase
var listSource; // database sources
var userId; 
var listSourceBanese; // only for the Banese subsection

// For printing tables
var printNK; //print NdihmeKerkues
var printNKEnglish; 
var printN; // print Ndihmues
var printNEnglish;
var printM; // print Materiale
var printMEnglish; 


// INITIALIZE (KIC)
firebase_db = firebase.database(); // because it's used many times
listSource = ['ndihme-kerkues','ndihmues','materiale']; // database sources
listSourceBanese = ['ndihme-kerkues','ndihmues'] 

firebase.auth().onAuthStateChanged((user) => {  // user initialization
    if (user) {  // User logged in already or has just logged in.
      userId = user.uid;
    } else {}});
// for the tables
printNK = ['adresa', 'emer', 'sa persona', 'shenime', 'sociale','telefon', 'kohe'];
printN  = ['adresa', 'emer', 'sa persona', 'shenime', 'sociale', 'kohe'];
printNKEnglish = ['address','name', 'no_people','notes','social','telephone','time'];
printNEnglish  = ['address','name', 'no_people','notes','social','time'];
printM = ['adresa', 'sasia', 'telefon','lloji'];
printMEnglish = ['m_address', 'm_quantity', 'm_telephone', 'm_type'];


// DEFINE FUNCTIONS FOR LATER USAGE
function updateFromFile(file, element, text_html=0)
{   
    // TODO: bad usage here of XMLHTTPRequest - its synchronous
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                if (text_html){
                    element.innerHTML = allText;
                }
                else{
                    element.innerText = allText;
                }
            }
        }
    }
    rawFile.send(null);
}

/**-------------------------------------------------------------------------
 * GENERAL
 */
//LOADER
// need to stop when the exercise data loads
function loader( time) {
    setTimeout(showPage, time);
}
function showPage() {
    document.getElementById("loader").style.display = "none";
}
//TIMER
TimeMe.initialize({
    currentPageName: "play", // current page
    idleTimeoutInSeconds: 600 // seconds
});

// Signout
function doSignOut(){
    firebase.auth().signOut().then(function() {
        console.log('Signed Out');
      }, function(error) {
        console.error('Sign Out Error', error);
      });
    window.location.href = "/index.html";
}


/**-------------------------------------------------------------------------
 * TAB: PERDORIMI
 */
// define
var messagePerdorimi;
// initialize
messagePerdorimi = document.getElementById('messagePerdorimi');
// update element with file
updateFromFile("message.html", messagePerdorimi, 1 );

/*-------------------------------------------------------------------------
 * TAB: POSTIMET
 * SHOW WHAT I POSTED: MATERIAL AND HOUSES
 */

// initialize

// define functions
function postimet(){
    /**
     * posts all the data related to this specific user.
     * 1. Get user data
     * 2. Decide on what to print
     * 3. Create the Html to print, and append it.
     */

    // define
    var user_data, postimi, s_keys;// related to data
    var html_txt; 
    var columns, cols; // needed for printing

    listSource.forEach( function( category){
        // read info from database
        firebase_db.ref(category).once("value", gotDataNK, errDataNK)
        // function to show what to do with the data when the data has been taken
        function gotDataNK(data) {

            try {
                // 1. get user data
                user_data = data.val()[userId];
                // get last input for each 
                postimi = user_data[ Object.keys(user_data).slice(-1)];
                s_keys = Object.keys(postimi);

                // 2. decide on what to print
                columns = printNK;
                cols = printNKEnglish;
                if (category === 'materiale'){
                    columns = printM;
                    cols = printMEnglish;
                }
                // 3. create and update html text
                html_txt =  "<p><strong>" + category.toUpperCase() + "</strong><br />";
                for(var i=0; i<s_keys.length; i++){
                    if (cols.includes( s_keys[i])){
                        html_txt = html_txt + "<strong>"+ columns[i]+"</strong>:"+ postimi[ s_keys[i]]+"<br />";
                    }
                }
                html_txt += "</p><hr>";
                document.getElementById( "postimi-"+category).innerHTML=html_txt;
            }
            catch(err){console.log("Error");}
            finally{}
        }
        
        // when there is an error from reading from the database
        // force people to login again. 
        function errDataNK(err) {
            console.log("Error");
            window.location.href = "/index.html";
            alert("Nisu dhe nje here nga fillimi te lutem.");
            
        }
    })
}

// delete with user's demand
function deleteAll(){
    /**
     * Deletes information of the user
     * 1. Confirm.
     * 2. Delete. 
     */

    // confirm this user
    if ( !(confirm("A jeni te sigurt se doni te fshini te gjithe te dhenat qe keni futur derime tani?"))){
        return;
    }

    // for each of the source delete the info related to this user
    for( var i in listSource){
        category = listSource[i];
        firebase_db.ref(category).child(userId).remove() 
          .then(function() { deleted = 1;})
          .catch();
    }
    alert("Rifreskoni faqen per te pare rezultatet.");

}

// call functions
postimet();

/**-------------------------------------------------------------------------
 * TAB: BANESE E PERKOHSHME
 */
// update Form based on user
document.getElementById('selector').addEventListener('click', updateForm);
function updateForm(){
    /**
     * Update form's placeholders depending on the selector's value. 
     */

    // check selector if helper
    if (selector.value === '1') {
        document.getElementById('address').placeholder="Adresa";
        document.getElementById('no_people').placeholder="Numri i personava nga nje familje qe mund te pranoni?";
        document.getElementById('time').placeholder="Per sa kohe mund te mirepritni nje familje?";
    }
    // check selector if to be helped 
    else {
        document.getElementById('address').placeholder="Ku jetonit me perpara ose ku do ishte ne rregull te jetoni perkohesisht?";
        document.getElementById('no_people').placeholder="Sa persona jeni? Shkruani ne shenime per raste te vecanta.";
        document.getElementById('time').placeholder="Per sa kohe mund te gjeni nje mundesi tjeter vendbanimi?";
    }
}

// update the list of people
function infoBanese() {
    /**
     * Update information on "Banese e perkohshme"
     * i. for both subtabs:
     *      1. extract last input for all people
     *      2. create names of the columns to be considered for printing
     *         depending on case
     *      3. update each row
     */

    // define 
    var all_users, user_ids ; // s.e.
    var tbl, tbdy; // table, body of table
    var tr, td; // row, column of row
    var columns, cols; // names of columns to be considered
    var width; // update width of column depending on each

    listSourceBanese.forEach( function( category){
    
    // read info from database
    firebase_db.ref(category).once("value", gotDataNK, errDataNK)

    // function to show what to do with the data when the data has been taken
    function gotDataNK(data) {
        try{
        // Extract all users - TODO: Don't need to do this, can play with values - not keys 
        all_users = data.val();
        user_ids = Object.keys(all_users);
        // create table and body of table
        tbl = document.createElement('table');
        tbdy = document.createElement('tbody');

        // decide on which group to work 
        columns = printNK; 
        cols = printNKEnglish;
        // if it is ndihmues - don't show the phone number
        if(category == 'ndihmues'){
            columns = printN;  
            cols = printNEnglish;
        }
        // create first line of titles of the table
        var width = document.getElementById(category+"-panel").offsetWidth/columns.length;
        tr = document.createElement('tr');
        for (var j=0; j< columns.length; j++){
            td = document.createElement('td');
            td.appendChild(document.createTextNode( columns[j]));
            tr.appendChild(td);
        }
        tbdy.appendChild(tr);

        // add the rows of the table for each user
        for (var i = 0; i < user_ids.length; i++) {
            
            // get submissions for this user
            var subs = Object.keys(all_users[ user_ids[i]]);
            // my only submission will be my last submission
            var my_subs = all_users[ user_ids[i]][subs[subs.length-1]]
            // these are my areas
            var s_keys = Object.keys(my_subs);
            s_keys.pop();
            
            // add elements(columns) to 1 row
            tr = document.createElement('tr');
            for(var j=0; j<s_keys.length ; j ++){
                if ( cols.includes(s_keys[j])){
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode( ""+my_subs[ s_keys[j]]));
                    td.style.width= width;
                    tr.appendChild(td);
                }
            }
            tbdy.appendChild(tr);
        }
        // append to table
        tbl.appendChild(tbdy);

        // append table to the background after removing existing data
        // remove data here
        panelNode = document.getElementById(category+"-panel")
        while (panelNode.firstChild) {
            panelNode.removeChild(panelNode.firstChild);
        }
        panelNode.append(tbl);
        }
        catch{ }
    }
    
    function errDataNK(err) {
        alert("Nisu dhe nje here nga fillimi te lutem.")
        window.location.href = "/index.html";
    }
    });
};

function submitSelection(e) {
    /**
     * Submit button functionality
     * 1. get the data from the form
     * 2. depending on what they want update database from their previous choice.
     * Note: use try to skip possible errors that can interrupt the connection.
     */

    // define
    var data, upload; // data from form, data to database
    var selector; // from the form - updates what kind of update to be done

    try{
    // TODO: Add loader here after submission pressed to give 
    // the idea that it is working - does not work for now.
    // LIKED: http://www.marcorpsa.com/ee/t2228.html

    // TODO: Required all fields!
    e.preventDefault(); // stop from reloading

    // get data from the form
    data = document.getElementsByClassName("f_values");
    selector = document.getElementById('selector');
    // keep the data in the form in a json format
    upload = {};
    for (var i = 0; i < data.length; i++) {
        upload[data[i].id] = data[i].value;
        data[i].value= ""
    }
    upload['timespent'] = TimeMe.getTimeOnCurrentPageInSeconds();
    
    // depending on what kind of person they are, push the data 
    if (selector.value === '1') {
        firebase_db.ref('ndihmues/' + userId).set(upload);
    } else if (selector.value === '2') {
        firebase_db.ref('ndihme-kerkues/' + userId).set(upload);
    } else{// exceptions
        alert("Situata duket problematike.Ju lutem kontrolloni informacionin qe futet.")
    }
    }
    catch(err){
        console.log( "Error");
    }
}

// call functions
infoBanese();
// submission button functionality
document.getElementById('submitButton').addEventListener('click', submitSelection, false);

/**-------------------------------------------------------------------------
 * TAB: MATERIALS
 */

function submitMaterial(e) {
    /**
     * Submit the material to be shared. 
     * 1. Get the form's values.
     * 2. Update the value in the database.
     *  TODO: Can you merge this function with the other submit?!
     */

    var data, upload;

    try{
    // TODO: Add loader function
    // TODO: Add required to all fields
    e.preventDefault(); // stop from reloading

    // data extracted from the form
    data = document.getElementsByClassName("m_values");
    upload = {};
    for (var i = 0; i < data.length; i++) {
        upload[data[i].id] = data[i].value;
        data[i].value = "";
    }
    upload['timespent'] = TimeMe.getTimeOnCurrentPageInSeconds();

    // update database
    firebase_db.ref('materiale/' + userId).set(upload);
    }
    catch(err){
        console.log( err.message);
    }
}

// create Table having all the materials updated. 
function appendMaterials() {
    /**
     * Print the materials which are available to be exchange or provided.
     * 1. Get the data from the database
     * 2. Create the name of columns. 
     * 3. Add rows for each of the materials
     * TODO: Improve the running time for this. Idea: Zip
     * TODO: This is like the other print function. To be merged. 
     */

    // define
    var materials; // data from database
    var tbl, tbdy;  // table, table body
    var tr, td;     // rows, columns of rows
    var columns, cols; //columns to print
    var width; // width of the column to make it changable based on screen width.

    // single user definitions
    
    // read from database
    firebase_db.ref('materiale').once("value", gotDataM, errDataM)
    
    // function to show what to do with the data when the data has been taken
    function gotDataM(data) {
        try{
        // get data from database
        materials = Object.values(data.val());

        // create table and body of table
        tbl = document.createElement('table');
        tbdy = document.createElement('tbody');

        // ndihme-kerkues
        columns = printM;
        cols = printMEnglish;
        // to keep track of the width of columns
        width = document.getElementById("shared-panel").offsetWidth/columns.length;
        // create row of names
        tr = document.createElement('tr');
        for (var j=0; j< columns.length; j++){
            td = document.createElement('td');
            td.appendChild(document.createTextNode( columns[j]));
            tr.appendChild(td);
        }
        tbdy.appendChild(tr);

        // create row of data
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
        // append to table
        tbl.appendChild(tbdy);

        // this is faster for "on" -changed after Once
        panelNode = document.getElementById("shared-panel");
        while (panelNode.firstChild) {
            panelNode.removeChild(panelNode.firstChild);
        }
        panelNode.append(tbl);
        }
        catch(err){
            console.log( "Error");
        }
    }

    // when there is an error from reading from the database
    function errDataM(err) {
        console.log(err)
        alert("Nisu dhe nje here nga fillimi te lutem.")
        window.location.href = "/index.html";
    }
}

// call functions
// submission button functionality
document.getElementById('addMaterialButton').addEventListener('click', submitMaterial, false);
appendMaterials();