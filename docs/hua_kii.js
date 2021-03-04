$(document).ready(function () {

    $("#picture").prop("disabled", true);
    $("#picture i").addClass("fa-spin");

    var modelLoaded = false;
    var jsonLoaded = false;

    function enableApp(){
        if (modelLoaded === true  && jsonLoaded === true){
            $("#picture").prop("disabled", false);
            $("#picture i").removeClass("fa-spin");
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
        console.log(textStatus);
        console.log(errorThrown);
        $('#error').css('display','inline');
        if(textStatus == "parsererror") {
            $('#error').text('Dictionary error, check for unclosed qoutations');
        }
        $('#error').fadeOut(2000, 'linear');
        
    });

    var width = $( window ).width()-35;
    var height = $( window ).height() - 110 ;

     $("#canvas").width(width).height(height);
    var canvas =  $('#canvas')[0];
    var context = canvas.getContext('2d');
    context.canvas.height = height;
    context.canvas.width = width;
    

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

    function fileOnload(e) {
        var $img = $('<img>', { src: e.target.result });
        $img.on('load',function() {
            context.setTransform(1, 0, 0, 1, 0, 0);

            context.clearRect(0, 0, canvas.width, canvas.height);

            // on mobile image is rotated
            imageHeight = this.naturalWidth;
            scale = width / this.naturalHeight;
            //canvas.width = this.naturalWidth;
            //canvas.height = this.naturalHeight;
            //context.scale(scale,scale );
            context.rotate(90*Math.PI/180);
            //context.scale(scale,scale );
            context.drawImage(this, 0, -width, height, width  );
             
             //context.save();
            handleInference();
        });
    }

    $('#canvas').click(handleInference);

    function handleInference(event) {
       if (!model) {
         console.log('Wait for model to load before clicking!');
         return;
       }

       $("#picture").prop("disabled", true);

       var imageElement = $('#canvas').get()[0];
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
            var ctx = canvas.getContext("2d");
            ctx.rotate(-90*Math.PI/180);
            ctx.font = "60px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("[ "+word+" ]", canvas.width/2, canvas.height/1.33); 
       });
     }

 });
