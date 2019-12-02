/**
 * Author: Doren
 * Functionality: Keeping the methods clean from here.
 */



/**-------------------------------------------------------------------------
 * TAB: BANESE E PERKOHSHME
 */

function updateFormHelper(){
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
function infoBaneseHelper() {
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
        width = document.getElementById(category+"-panel").offsetWidth/columns.length;
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

