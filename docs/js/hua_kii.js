$(document).ready(function () {

    //$("#picture").prop("disabled", true);
    $("#takePhotoButton").addClass("fa-spin");

    var modelLoaded = false;
    var jsonLoaded = false;

    var handleInference = function (image) {
        if (!model) {
          console.log('Wait for model to load before clicking!');
          return;
        }
 
        $("#picture").prop("disabled", true);
 
        var imageElement = image; //$('#canvas').get()[0];
        // We can call model.classify 
        model.detect(imageElement).then(function (predictions) {
             console.log(predictions);
 
             // Initialize to default null state
             var word = "*";
             
             if(predictions !== undefined && predictions.length > 0){
                 data = predictions[0];
                 // Default to model response if no dictionary overide exists
                 word = dictionary[data.class] != undefined ? dictionary[data.class] : data.class;
 
                 $("#hawaiian").text(word);
                 console.log("SUCCESS : ", data);
                 $("#picture").prop("disabled", false);
             }
             $('#recognitionText').show();
             $('#recognitionText').text("[ "+word+" ]"); 
             $('#recognitionText').fadeOut(3000, function(){
                $('#recognitionText').text("");
             });
        });
      }

    function enableApp(){
        if (modelLoaded === true  && jsonLoaded === true){
            $('#huakiiImage').fadeOut(500);
            console.log('initialize camera');
            $("#takePhotoButton").removeClass("fa-spin");
            initializeCamera(handleInference);
        }
    }

    cocoSsd.load().then(function (loadedModel) {
        model = loadedModel;
        console.log("model loaded:" + model);
        modelLoaded = true;
        enableApp();
    });

    var dictionary = {};
    $.getJSON('dictionary.json', function(data){
        jsonLoaded = true;
        dictionary = data;
        console.log(dictionary);
        enableApp();
    })
    .fail(function(jqXHR, textStatus, errorThrown){
        jsonLoaded = true;
        console.log(textStatus);
        console.log(errorThrown);
        $('#errorText').show();
        $('#errorText').text(textStatus);
        if(textStatus == "parsererror") {
            $('#errorText').text('Dictionary error, check for unclosed qoutations! Using English');
        }
        $('#errorText').fadeOut(2000, 'linear');
        enableApp();
    });

    $('#sampleFile').change(function(e) {
        console.log(e);
        var file = e.target.files[0];

        var imageType = /image.*/;

        if (!file.type.match(imageType))
            return;

        var reader = new FileReader();
        reader.onload = fileOnload;
        reader.readAsDataURL(file);
    });    

 });
