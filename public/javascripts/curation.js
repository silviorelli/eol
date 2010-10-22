if(!EOL) { var EOL = {}; }
if(!EOL.Curation) { EOL.Curation = {}; }

// Update the image(s) now that it's been curated:
EOL.Curation.post_curate_image = function(args) {
  var dato_id = args[0]; var visibility_id = args[1]; var vetted_id = args[2];
  EOL.Curation.update_icons(dato_id, visibility_id);
  EOL.handle_main_img_icon(dato_id);
  thumbnail = $('#thumbnails a[href='+dato_id+']')
  image = $('#image-'+dato_id);
  notes = $('#mc-notes-'+dato_id);
  classes = 'trusted unknown untrusted unknown-text untrusted-text';
  thumbnail.removeClass(classes);
  image.removeClass(classes);
  notes.removeClass(classes);
  if (vetted_id == EOL.Curation.UNTRUSTED_ID) {
    thumbnail.addClass('untrusted');
    image.addClass('untrusted');
    notes.addClass('untrusted-text');
  } else if (vetted_id == EOL.Curation.UNKNOWN_ID) { // Never really happens, since we can't "unknow" something...
    thumbnail.addClass('unknown');
    image.addClass('unknown');
    notes.addClass('unknown-text');
  } else {
    thumbnail.addClass('trusted');
    image.addClass('trusted');
  }
};
// Update text objects after curation:
EOL.Curation.post_curate_text = function(args) {
  var data_object_id = args[0]; var visibility_id = args[1]; var vetted_id = args[2];
  EOL.log("Curate text: "+data_object_id+", "+visibility_id+", "+vetted_id);
  $('div#text_buttons_'+data_object_id+' div.trust_button').remove();
  $('div#text_buttons_'+data_object_id+' div.untrust_button').remove();
  $('#text_'+data_object_id).removeClass('untrusted unknown trusted');
  if (vetted_id == EOL.Curation.UNTRUSTED_ID) {
    $('#text_'+data_object_id).addClass('untrusted');
  } else if (vetted_id == EOL.Curation.UNKNOWN_ID) { // Never really happens, since we can't "unknow" something...
    $('#text_'+data_object_id).addClass('unknown');
  }
  EOL.Curation.update_icons(data_object_id, visibility_id);
};
// Invisible icons on text:
EOL.Curation.update_icons = function(data_object_id, visibility_id) {
  $('ul[data-data_object_id='+data_object_id+'] li.invisible_icon').hide();
  $('ul[data-data_object_id='+data_object_id+'] li.inappropriate_icon').hide();

  // NOTE: show() doesn't work for image thumbnails, because the diplay ends up with the wrong value.
  if(visibility_id == EOL.Curation.INVISIBLE_ID) {
    $('ul[data-data_object_id='+data_object_id+'] li.invisible_icon').css({display: 'inline-block'});
  } else if(visibility_id == EOL.Curation.INAPPROPRIATE_ID) {
    $('ul[data-data_object_id='+data_object_id+'] li.inappropriate_icon').css({display: 'inline-block'});
  }
};

$(document).ready(function() {
  $('form.curation input[type="submit"]').click(function() {
    var form = $(this).closest('form');
    form.find('div.processing').show();
    $.ajax({
      url: form.attr('action'),
      type: 'PUT',
      dataType: 'json',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Accept", "text/javascript"); // Sorry, not sure why this xhr wasn't auto-js, but it wasn't.
        form.find(':submit').attr('disabled', 'disabled');
      },
      complete: function() {
        form.find(':submit').attr('disabled', '');
        form.find('div.processing').fadeOut();
      },
      success: function(response) {
        EOL.log("here");
        EOL.log('type: '+response.type);
        EOL.log('args: '+response.args);
        if (response.type == "text") {
          EOL.log("texty");
          EOL.Curation.post_curate_text(response.args);
          EOL.log("EOL.Curation.post_curate_text("+response.args+");");
        } else {
          EOL.log("imaged");
          EOL.Curation.post_curate_image(response.args);
        }
      },
      data: $(form).serialize()
    });
    return false;
  });
  // Show untrust reasons when it's ... uhhh.... untrusted. 
  $('div.vetted .untrust input[type="radio"]').click(function() {
    $(this).parent().find('div.reason').slideDown();
  });
  // Hide untrust reasons when it's trusted:
  $('div.vetted .trust input[type="radio"]').click(function() {
    $(this).parent().parent().find('div.reason').slideUp();
  });
  // Cancel button just clicks the closest close-link:
  $('form.curation .cancel-button').click(function() {
    $(this).closest('div.overlay, div.text-slidebox-container').find('a.close, a.close-button').click();
  });
  // Text curation isn't an overlay, so we need to manually make the close link work:
  $('div.text_curation_close a.close-button').click(function() {
    $(this).parent().parent().parent().slideUp();
  });
});
