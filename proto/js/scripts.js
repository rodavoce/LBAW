// Get query params
var urlParams;
(window.onpopstate = function() {
    var match,
        pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
})();


$(document).ready(function() {
    if ($('body').hasClass('admin')) {
        loadAdmin();
    } else if ($('body').hasClass('profile')) {
        loadProfile();
    } else if ($('body').hasClass('createTopic')) {
        loadCreateTopic();
    } else if ($('body').hasClass('editProfile')) {
        loadEditProfile();
    } else if ($('body').hasClass('search')) {
        loadSearch();
    } else if ($('body').hasClass('topic')) {
        loadTopic();
    }

    loadFooter();
});

function loadAdmin() {
    createAdminCharts();
    loadMemberList();
}

function loadProfile() {
    createUserCharts();
}

function loadCreateTopic() {
    validateCreateTopic();
    disableKeySubmit("createTopicForm");
    runTextEditor();
}

function loadEditProfile() {
    handleTemplates();
}

function loadSearch() {
    searchOptions();
}

function loadTopic() {
    updateVisualizations();
}


function updateVisualizations() {
    $.ajax({
        type: "post",
        url: "../../api/topic/updateVisualizations.php",
        data: {
            id: urlParams['id'],
        }
    });
}


/* Função utilizada em calls do 'upvote' (não é necessário fazer load) */
function verifyVote(type, topicId) {
    var voteType = type;
    var topic = topicId;

    $.ajax({
        type: "post",
        url: "../../api/topic/validate_vote.php",
        data: { voteType: voteType, topicId: topic }
    }).done(function(data) {
        console.log(data);
        var value = JSON.parse(data);
        console.log(value);

        console.log($("button.rating.btn").text());

        if (value != 1) {
            if (type == 'upvote') {
                $("button.rating.btn").text(parseInt($("button.rating.btn").text()) + 1);
                console.log(type);
            } else if (type == 'downvote') {
                console.log(type);
                $("button.rating.btn").text(parseInt($("button.rating.btn").text()) - 1);
            }
        }

    });

    return false;
}


function loadFooter() {
    var docHeight = $(window).height();
    var footerHeight = $('#footer').height();
    var footerTop = $('#footer').position().top + footerHeight;

    if (footerTop < docHeight) {
        $('#footer').css('margin-top', 10 + (docHeight - footerTop) + 'px');
    }
}


function createAdminCharts() {
    $.ajax({
        type: "post",
        url: "../../api/admin/getChartsInfo.php",
        data: {}
    }).done(function(data) {
        var info = JSON.parse(data);
        var ctx = document.getElementById("topics-by-tags").getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: info[0],
                datasets: [{
                    label: "tags",
                    backgroundColor: [
                        "#2ecc71",
                        "#3498db",
                        "#93a5a6",
                        "#9b59b6",
                        "#f1c40f",
                        "#e74c3c",
                        "#34495e"
                    ],
                    data: info[1]
                }],
            },

            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                }
            }
        });
    });
}


function loadMemberList() {
    $('#user-pagination').twbsPagination({
        totalPages: pages,
        visiblePages: 10,
        first: 'Inicio',
        prev: 'Anterior',
        next: 'Seguinte',
        last: 'Fim',
        onPageClick: function(event, page) {
            $.getJSON("../../api/member/memberList.php", {
                page: page - 1
            }, function(data) {
                $('#userlist .list-group').empty();
                for (var i = 0; i < data.length; i++) {
                    $('#userlist .list-group').append('<li class="list-group-item"> \
                    <a href="../../pages/member/profile.php?id=' + data[i].id + '">' + data[i].name + '</a> \
                    <i class="glyphicon glyphicon-remove pull-right"></i> \
                    </li>');
                }
            });
        }
    });
}


function createUserCharts() {
    $.ajax({
        type: "post",
        url: "../../api/member/getChartsInfo.php",
        data: {}
    }).done(function(data) {
        var info = JSON.parse(data);
        var ctx = document.getElementById("accepted-answers").getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: info[0],
                datasets: [{
                    backgroundColor: [
                        "#2ecc71",
                        "#3498db",
                        "#95a5a6",
                        "#9b59b6",
                        "#f1c40f",
                        "#e74c3c",
                        "#34495e"
                    ],
                    data: info[1]
                }]
            }
        });
        var ctx = document.getElementById("where-i-comment").getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: info[2],
                datasets: [{
                    backgroundColor: [
                        "#2ecc71",
                        "#3498db",
                        "#95a5a6",
                        "#9b59b6",
                        "#f1c40f",
                        "#e74c3c",
                        "#34495e"
                    ],
                    data: info[3]
                }]
            }
        });
    });
}



function validateCreateTopic() {
    $('#createTopicForm').submit(function(e) {
        if ($("#wmd-input").val().length < 20) {
            e.preventDefault();
            $('#createTopic-messages').html('<div class="alert alert-warning" role="alert">A descrição tem de ter no mínimo 20 caracteres.</div>');
        }
    });
}


function disableKeySubmit(formid) {
    $("#" + formid).on("keyup keypress", function(e) {
        var keyCode = e.keyCode || e.which;
        if (!$("#wmd-input").is(":focus")) {
            if (keyCode === 13) {
                e.preventDefault();
                return false;
            }
        }
        return true;
    });
}


function runTextEditor() {
    var converter = Markdown.getSanitizingConverter();
    var editor = new Markdown.Editor(converter);
    editor.run();

    $("#wmd-redo-button").addClass("hidden-xs");
    $("#wmd-undo-button").addClass("hidden-xs");
    $("#wmd-spacer3").addClass("hidden-xs");
    $("#wmd-button-row").append("<li class='wmd-spacer hidden-xs' style='left:370'></li>");
    $("#wmd-button-row").append("<li class='wmd-button hidden-xs' id='help-button'  title='Heading <h1>/<h2> Ctrl+Shift+H' style='left: 385px;'><span style='background-position: -240px 0px;'></span></li>");
    $("#help-button").click(function() {
        $("#squarespaceModal").modal('toggle');
    });
    $("#wmd-preview").css({ 'word-wrap': "break-word" });
    $("#wmd-preview").css({ 'width': "100%" });
}


function handleTemplates() {
    $('#editProfile').on('click', '.add-email', function() {
        var template = $('#email-template');
        template.clone()
            .removeClass('hide')
            .removeAttr('id')
            .insertBefore(template);
    }).on('click', '.remove-email', function() {
        $(this).parents('.form-group').remove();
    });

    $('#editProfile').on('click', '.add-link', function() {
        var template = $('#link-template');
        template.clone()
            .removeClass('hide')
            .removeAttr('id')
            .insertBefore(template);
    }).on('click', '.remove-link', function() {
        $(this).parents('.form-group').remove();
    });
}


function searchOptions() {
    if ($(".resultTitle").length < 1) {
        $("#search_title").prop('checked', false);
    }

    if ($(".resultTag").length < 1) {
        $("#search_tags").prop('checked', false);
    }

    if ($(".resultUser").length < 1) {
        $("#search_users").prop('checked', false);
    }

    if ($(".resultContent").length < 1) {
        $("#search_content").prop('checked', false);
    }

    $("#search_title").click(function() {
        if (this.checked) {
            $('.resultTitle').show("slow");
        } else {
            $('.resultTitle').hide("slow");
        }

        results();
    });

    $('#search_tags').click(function() {
        if (this.checked) {
            $('.resultTag').show("slow");
        } else {
            $('.resultTag').hide("slow");
        }

        results();
    });

    $('#search_users').click(function() {
        if (this.checked) {
            $('.resultUser').show("slow");
        } else {
            $('.resultUser').hide("slow");
        }

        results();
    });

    $('#search_content').click(function() {
        if (this.checked) {
            $('.resultContent').show("slow");
        } else {
            $('.resultContent').hide("slow");
        }

        results();
    });

    results();
}

function results() {
    if ($('#search_users').length > 0 &&
        $('#search_tags').length > 0 &&
        $('#search_users').length > 0 &&
        $('#search_title').length > 0) {

        var tagLength = $(".resultTag").length;
        var titleLenght = $(".resultTitle").length;
        var contentLenght = $(".resultContent").length;
        var total = tagLength + titleLenght + contentLenght;

        if (total < 1) {
            $(".info-msg-topic").show();
        } else {
            var tags = $('#search_tags')[0].checked;
            var title = $('#search_title')[0].checked;
            var content = $('#search_content')[0].checked;

            if (tags != true) {
                total -= tagLength;
            }

            if (content != true) {
                total -= contentLenght;
            }

            if (title != true) {
                total = total - titleLenght;
            }

            if (total > 0) {
                $(".info-msg-topic").hide();
            } else {
                $(".info-msg-topic").show();
            }
        }

        if ($(".resultUser").length < 1 || $('#search_users')[0].checked == false) {
            $(".info-msg-user").show();
        } else {
            $(".info-msg-user").hide();
        }
    }
}