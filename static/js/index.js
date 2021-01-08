function mirrorz (json) {
  site = json["site"]
	$.each(json['mirrors'], function(i, e) {
    //d = $('<div>', {text: e["cname"]});
    id = 'mirrorz-'+e["cname"];
    full_url = e["url"][0] == "/" ? site["url"]+e["url"] : e["url"];
    full_help = e["help"][0] == "/" ? site["url"]+e["help"] : e["help"];
    f = (ul) => {
      return ul.append(
          $('<li>').append(
            $('<span>').append(
              $('<a>', {"href": full_url, "text": site["abbr"]})
            )
          ).append(
            $('<span>', {"text": e["desc"]})
          ).append(
            $('<span>').append(
              $('<a>', {"href": full_help, "text": full_help.length > 0 ? '?' : ''})
            )
          ).append(
            $('<br>')
          ).append(
            $('<span>').append(
              $('<a>', {"href": e["upstream"], "text": e["upstream"]})
            )
          ).append(
            $('<span>', {"text": e["status"]})
          )
        )
    }
		ul = $('#'+$.escapeSelector(id));
    if ( ul.length == 0 ) {
      $('#mirrorz').append(
        $('<div>', {"class": "mirrorz-div"}).append(
          $('<h3>', {"text": e["cname"]})
        ).append(
          f($('<ul>', {"id": id}))
        )
      );
    } else {
      f(ul);
    }
	});
}

$(document).ready(() => {
  $.each([
    '/static/tuna/neo.json',
    '/static/tuna/nano.json',
    '/static/tuna/bfsu.json',
    '/static/tuna/opentuna.json',
  ],
  (i, url) => {
    $.ajax({ 
      type: 'GET', 
      url: url, 
      dataType: 'json',
      success: mirrorz,
    });
  });
	$('.mirrorz-div').sort(function(a, b) {
	  if ($('h3', a).text() < $('h3', b).text()) {
	    return -1;
	  } else {
	    return 1;
	  }
	}).appendTo('#mirrorz');
});

// vim: sts=2 ts=2 sw=2 expandtab
