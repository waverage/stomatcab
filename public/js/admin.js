var host_name = "";

$(function(){
    host_name = "http://" + window.location.host;
    //console.log(host_name);
    $.datetimepicker.setLocale('ua');
    $('#plane-timepicker').datetimepicker({
        inline: true,
        allowTimes: getAllowTimesFromStartEnd(),
        formatDate: 'Y/m/d',
        yearEnd: new Date().getFullYear(),
        yearStart: new Date().getFullYear() ,
        //minDate: calcMinDate(),
        maxDate: calcMaxDate(),
        scrollMonth: false,
        onSelectDate: updateTimeLine,
        onChangeMonth: function(){
            setTimeout(function(){//Задержка нужна потому что скрипт
                updateHandlerDates();//календаря не успевает обновить елементы
                updateTimeLine();
                $('.xdsoft_date.xdsoft_current').removeClass('xdsoft_current');
            }, 300);
            
        }
    });
    setTimeout(function(){
        fullingOption();
        initHandlers();
    }, 100);

    $('.xdsoft_calendar').unbind();

    setTimeout(function(){
        $('td.xdsoft_current').removeClass('xdsoft_current');
        updateHandlerDates();
        updateTimeLine();
    }, 300);
});

function fullingOption() {

    $.ajax({//hours option
        url: host_name + '/hours-work',
        method: 'GET',
        success: function( data ) {
            $('#slider-time-work').slider({
                range: true,
                min: 0,
                max: 23,
                values: [ data.start, data.end ],
                slide: function( e, ui ) {
                    $('#amount-time').val(ui.values[ 0 ] + ":00 - " + ui.values[ 1 ] + ":00" );
                }
            });
            $( "#amount-time" ).val( $( "#slider-time-work" ).slider( "values", 0 ) +
              ":00 - " + $( "#slider-time-work" ).slider( "values", 1 ) + ":00" );
        }
    });

    $.ajax({//weekday option
        url: host_name + '/weekendday',
        method: 'GET',
        success: function( data ) {
            for( var i in data ) {
                if( /day[0-6]/.test(i) ) {
                    if( data[i] === true ) {
                        $( '#weekend-day' + i.slice(-1) ).attr('checked', 'checked');
                    }
                }
            }
        }
    });
}

function initHandlers() {
    $('#save-option-prices').click(function(e) {
        var outputArr = [];
        var li_list = $('#price-list-table tr');
        var curr;
        for( var i = 1; i < li_list.length; i++ ) {
            var obj = {};
            if( $(li_list[i]).hasClass('price-item') ) {
                obj.name = $(li_list[i]).find('td').first().text();
                obj.price = $(li_list[i]).find('td').first().next().text();
                obj.list = [];
            } else if( $(li_list[i]).hasClass('price-item-group') ) {
                obj.name = $(li_list[i]).find('td').first().text();

                if( obj.name.slice(-2) == ": " ) {
                    obj.name = obj.name.slice(0, -2);
                }
                
                obj.list = [];
                curr = $(li_list[i]).next();
                while( true ) {
                    if( $(curr).hasClass('price-subitem') ) {
                        obj.list.push({
                            name: $(curr).find('td').first().text(),
                            price: $(curr).find('td').first().next().text()
                        });
                    } else {
                        break;
                    }
                    curr = $(curr).next();
                }


            } else if( $(li_list[i]).hasClass('price-subitem') ) {
                continue;
            }
            outputArr.push(obj);
        }

        //Осталось отправить запрос
        var sendData = {
            list: JSON.stringify(outputArr)
        };
        $.ajax({
            url: host_name + '/update-price-list',
            method: 'POST',
            data: sendData,
            success: function( res ) {
                $('#save-option-prices+span').css('opacity', '1');
                    
                setTimeout(function(){
                    $('#save-option-prices+span').css('opacity', '0');
                }, 4500);
            }
        });
    });

    $('#price-list-table button.remove-service-item').click(function(e) {
        $(e.target).parent().parent().remove();
    });

    $('#price-list-table button.remove-service-group').click( removeServiceGroupHandler );

    $('#price-list-table button.add-service-item').click(addServiceItemHandler);

    $('#add-new-group-service').click(function(e) {
        var groupElem = elt('tr', { class: 'price-item-group' },
            elt('td', { contenteditable: 'true', inside: 'Нова група послуг' }),
            elt('td'),
            elt('td', { class: 'price-list-button-td' },
                elt('button', { class: 'remove-service-group', title: 'Видалити групу послуг', inside: '-'})
            ),
            elt('td', { class: 'price-list-button-td' },
                elt('button', { class: 'add-service-item', title: 'Додати послугу', inside: '+'})
            )
        );

        $('#price-list-table tbody').append( groupElem );
        var appendElem = elt('tr', { class: 'price-subitem' },
                elt('td', { contenteditable: 'true', inside: 'Назва послуги' }),
                elt('td', { contenteditable: 'true', inside: '0' }),
                elt('td', { class: 'price-list-button-td' },
                    elt('button', { class: 'remove-service-item', title: 'Видалити послугу', inside: '-' })
                ),
                elt('td', {})
            );
        $( groupElem ).find('.remove-service-group').click(removeServiceGroupHandler);
        $( groupElem ).find('.add-service-item').click(addServiceItemHandler);
        $( appendElem ).insertAfter( groupElem );
        $( appendElem ).find('.remove-service-item').click(function(e) {
            $(e.target).parent().parent().remove();
        });
    });

    $('#add-new-service').click(function(e) {
        var appendElem = elt('tr', { class: 'price-item'}, 
                elt('td', { contenteditable: "true", inside: "Назва послуги"}),
                elt('td', { contenteditable: 'true', inside: "0"}),
                elt('td', { class: "price-list-button-td" }, 
                    elt('button', { class: 'remove-service-item', title: 'Видалити послугу', inside: '-' })
                )
            );
        $('#price-list-table tbody').append( appendElem );
        $(appendElem).find('.remove-service-item').click(function(e) {
            $(e.target).parent().parent().remove();
        });
    });

    $('#logout-btn').click(function(){
        $.ajax({
            url: host_name + '/admin-logout',
            method: 'GET',
            success: function( res ){
                if( res === "OK" ) {
                    window.location = "http://localhost:3000/admin";
                } else {
                    console.log("Error logout: " + res);
                }
            }
        });
    });

    $('#save-option-time-work').click(function() {
        saveHoursWork(function(){
            $('#save-option-time-work+span').css('opacity', '1');
            
            setTimeout(function(){
                $('#save-option-time-work+span').css('opacity', '0');
            }, 4500);
        });
    });
    $('#save-option-weekend').click(function() {
        saveWeekendDays(function(){
            $('#save-option-weekend+span').css('opacity', '1');
            
            setTimeout(function(){
                $('#save-option-weekend+span').css('opacity', '0');
            }, 4500);
        });
    });

    $('button.day-function-new-enroll').click(function(e) {
        var windowPos = {
            x: ( document.documentElement.clientWidth / 2 ) - ( parseInt($('#window-record-client .inside-window').css('width')) / 2 ),
            y: ( document.documentElement.clientHeight / 2 ) - ( parseInt($('#window-record-client .inside-window').css('height')) / 2 )
        };
        $('#window-record-client').css('display', 'block');
        $('#window-record-client .inside-window').css('left', windowPos.x + 'px');
        $('#window-record-client .inside-window').css('top', windowPos.y + 'px');

        $('.btn-save-enroll').attr('disabled', 'disabled');
        var isBtnDisableTimer = setInterval(function(){
            var elem_select = document.getElementById("select-client");
            if( elem_select.value != "" ) {
                $('.btn-save-enroll').removeAttr('disabled');
            } else {
                $('.btn-save-enroll').attr('disabled', 'disabled');
            }
        }, 300);
        var list_client = [];
        $.ajax({
            url: host_name + '/client-list',
            method: 'GET',
            success: function( res ) {
                list_client = res;
                for( var i = 0; i < res.length; i++ ) {
                    var new_opt = document.createElement('option');
                    new_opt.text = res[i].surname + " " + res[i].name;
                    document.getElementById("select-client").add(new_opt);
                }
            }
        });

        $('.btn-close-inside-window').click(function(e) {
            $('#window-record-client').css('display', 'none');
            clearInterval(isBtnDisableTimer);
            $('#window-record-client .btn-save-enroll').unbind();
            $('.btn-close-inside-window').unbind();
        });

        $('#window-record-client .btn-save-enroll').click(function(e) {
            var elem_select = document.getElementById("select-client");
            if( elem_select.value == "" ) {
                return false;
            }
            var serched_user;
            var vname = elem_select.value.split(" ")[1];
            var vsurname = elem_select.value.split(" ")[0];
            for( var i = 0; i < list_client.length; i++ ) {
                if( list_client[i].surname == vsurname && 
                    list_client[i].name == vname ) {
                    serched_user = list_client[i];
                    break;
                }
            }
            var sendData = {
                name: serched_user.name,
                surname: serched_user.surname,
                email: serched_user.email,
                phone: serched_user.phone,
                comment: $('.commit-field').val(),
                year: $('.xdsoft_current.xdsoft_date').data('year'),
                month: $('.xdsoft_current.xdsoft_date').data('month'),
                day: $('.xdsoft_current.xdsoft_date').data('date'),
                hour: $('.xdsoft_current.xdsoft_time').text()
            };
            $.ajax({
                url: host_name + '/enrolled',
                method: 'POST',
                data: sendData,
                success: function( res ) {
                    updateHandlerDates();
                    updateTimeLine();
                }
            });
            clearInterval(isBtnDisableTimer);
            $('#window-record-client').css('display', 'none');
            $('#window-record-client .btn-save-enroll').unbind();
            $('.btn-close-inside-window').unbind();
        });
    });

    $('button.day-function-calculate-price').click(function(e) {
        var windowPos = {
            x: 50 - ( parseInt($('#window-calc-price .inside-window').css('width')) / 2 ),
            y: 5
        };

        $('#window-calc-price').css('display', 'block');
        $('#window-calc-price .inside-window').css('left', windowPos.x + '%');
        $('#window-calc-price .inside-window').css('top', windowPos.y + '%');

        $('#window-calc-price #output-list li').remove();
        $('.output-price span').text('0 грн.');

        $('#window-calc-price .btn-save-price').click(function(e) {
            var sendData = {
                price: parseInt($('.output-price span').text()),
                year: $('.xdsoft_date.xdsoft_current').data('year'),
                month: $('.xdsoft_date.xdsoft_current').data('month'),
                day: $('.xdsoft_date.xdsoft_current').data('date'),
                hour: $('.xdsoft_time.xdsoft_current').text() 
            };
            $.ajax({
                url: host_name + '/update-enroll',
                method: 'POST',
                data: sendData,
                success: function( res ) {
                    $('#window-calc-price').css('display', 'none');
                    $('#window-calc-price .btn-save-price').unbind();
                    $('.btn-close-inside-window').unbind();
                    $('.add-service-item').unbind();
                    $('.remove-service-item').unbind();
                    $('.day-info-list .day-info-price span').text( sendData.price + " грн." );
                }
            });
        });

        $('#output-list .remove-service-item').click(function(e) {
            $(e.target).unbind();
            $(e.target).parent().parent().remove();
            updateOutputPriceForServices();
        });
        
        $('#window-calc-price .btn-close-inside-window').click(function(e) {
            $('#window-calc-price').css('display', 'none');
            $('#window-calc-price .btn-close-inside-window').unbind();
            $('#window-calc-price button.add-service-item').unbind();
            $('#window-calc-price .btn-save-price').unbind();
            $('.add-service-item').unbind();
            $('.remove-service-item').unbind();
        });

        $('#window-calc-price button.add-service-item').click(function(e) {
            var parentButton = $(e.target).parent().parent();
            var priceService = $(parentButton).find('.price-block').text();
            var nameService;
            nameService = $(parentButton).find('.name-block').text();
            if( $(parentButton).hasClass('service-list-subitem') ) {
                parentButton = parentButton.parent().parent();
                nameService = $(parentButton).find('.name-block').first().text() + " : " + nameService;
            }

            $('#output-list').append(
                elt('li', {}, 
                    elt('span', { 
                        class: 'name-block', 
                        inside: nameService }), 
                    elt('span', { 
                        class: 'price-block',
                        inside: priceService }),
                    elt('span', { class: 'btn-block' }, 
                        elt('button', { 
                            class: 'remove-service-item', 
                            inside: '-', 
                            title: 'Відмінити послугу' })
                    )
                ));
            updateOutputPriceForServices();
            $('#output-list .remove-service-item').unbind();
            $('#output-list .remove-service-item').click(function(e) {
                $(e.target).unbind();
                $(e.target).parent().parent().remove();
                updateOutputPriceForServices();
            });

        });
        
    });

    $('button.day-function-close-hour').click(function(e) {
        var data = {
            comment: prompt('Коментар до блокування', ''),
            year: $('.xdsoft_date.xdsoft_current').data('year'),
            month: $('.xdsoft_date.xdsoft_current').data('month'),
            day: $('.xdsoft_date.xdsoft_current').data('date'),
            hour: $('.xdsoft_time.xdsoft_current').data('hour')
        };
        $.ajax({
            url: host_name + '/add-close-hour',
            method: 'POST',
            data: data,
            success: function( res ) {
                $('.xdsoft_time.xdsoft_current').addClass('hour-close');
                updateTimeLine();
            }
        });
    });

    $('button.day-function-open-hour').click(function(e) {
        var data = {
            year: $('.xdsoft_current.xdsoft_date').data('year'),
            month: $('.xdsoft_current.xdsoft_date').data('month'),
            day: $('.xdsoft_current.xdsoft_date').data('day'),
            hour: $('.xdsoft_current.xdsoft_time').data('hour')
        };

        $.ajax({
            url: host_name + '/remove-close-hour',
            method: 'POST',
            data: data,
            success: function( res ) {

                //$('.xdsoft_current.xdsoft_time.hour-close').removeClass('hour-close');
                updateTimeLine();
            }
        });
    });

    $('button.day-function-cancel-enroll').click(function(e) {
        var data = {
            month: $('.xdsoft_date.xdsoft_current').data('month'),
            day: $('.xdsoft_date.xdsoft_current').data('date'),
            hour: $('.xdsoft_time.xdsoft_current').text()
        };

        $.ajax({
            url: host_name + '/remove-enroll',
            method: 'POST',
            data: data,
            success: function( err, res ) {
                if( err ) console.log("Error: ", err);
                if( res === "success" ) {
                    $('.xdsoft_time.xdsoft_current').removeClass('xdsoft_time_close');
                    $('.day-info-empy-title').css('display', 'inline-block');
                    $('.day-info-list').css('display', 'none');
                    $('button.day-function-cancel-enroll').attr('disabled', 'disabled');
                    $('button.day-function-close-hour').removeAttr('disabled');
                    $('button.day-function-new-enroll').removeAttr('disabled');
                    updateHandlerDates();
                }
            }
        });
    });

    $('button.day-function-close-day').click(function(e) {
        $('button.day-function-close-day').attr('disabled', 'disabled');
        $('button.day-function-open-day').removeAttr('disabled');
        var curr = $('.xdsoft_date.xdsoft_current');
        var data = {
            year: curr.data('year'),
            month: curr.data('month'),
            day: curr.data('date')
        };

        $.ajax({
            url: host_name + '/add-close-day',
            method: 'POST',
            data: data,
            success: function( err, res ) {
                if( err ) throw new Error( err );
                if( res === "success" ) {
                    $('.xdsoft_current.xdsoft_date').addClass('day-close');
                    //$('.xdsoft_current.xdsoft_date').removeClass('xdsoft_current');
                }
            }
        });
    });

    $('button.day-function-open-day').click(function(e) {
        $.ajax({
            url: host_name + '/remove-close-day',
            method: 'POST',
            data: {
                year: $('.xdsoft_date.xdsoft_current').data('year'),
                month: $('.xdsoft_date.xdsoft_current').data('month'),
                day: $('.xdsoft_date.xdsoft_current').data('date')
            },
            success: function( res ) {
                $('.xdsoft_date.xdsoft_current').removeClass('day-close');
                updateHandlerDates();
                updateTimeLine();
            }
        });
    });
}

function removeServiceGroupHandler(e) {
    var mainGroup = $(e.target).parent().parent();
    var removeList = [mainGroup];
    var current = $(mainGroup).next();
    while( true ) {
        if( $(current).hasClass('price-subitem') ) {
            removeList.push($(current));
        } else {
            break;
        }
        current = $(current).next();
    }
    for( var i = 0; i < removeList.length; i++ ) {
        $(removeList[i]).remove();
    }
}

function addServiceItemHandler(e) {
    var parentElem = $(e.target).parent().parent();
    var appendElem = elt('tr', { class: 'price-subitem' },
            elt('td', { contenteditable: 'true', inside: 'Назва послуги' }),
            elt('td', { contenteditable: 'true', inside: '0' }),
            elt('td', { class: 'price-list-button-td' },
                elt('button', { class: 'remove-service-item', title: 'Видалити послугу', inside: '-' })
            ),
            elt('td', {})
        );
    $( appendElem ).insertAfter( $(parentElem) );
    $(appendElem).find('.remove-service-item').click(function(e) {
        $(e.target).parent().parent().remove();
    });
}

function updateOutputPriceForServices() {
    var listPrices = $('#output-list .price-block');
    var suma = 0;
    for( var i = 0; i < listPrices.length; i++ ) {
        suma += parseInt($(listPrices[i]).text());
    }
    $('.output-price span').text( suma + " грн.");
}

function saveHoursWork( calback ) {
    var data = {
        start: $( "#slider-time-work" ).slider( "values", 0 ),
        end: $( "#slider-time-work" ).slider( "values", 1 )
    };
    $.ajax({
        url: host_name + '/hours-work',
        method: 'POST',
        data: data,
        success: function(res){
            calback();
        }
    });
}

function saveWeekendDays( calback ) {
    var data = {
        day0: $('#weekend-day0').is(':checked'),
        day1: $('#weekend-day1').is(':checked'),
        day2: $('#weekend-day2').is(':checked'),
        day3: $('#weekend-day3').is(':checked'),
        day4: $('#weekend-day4').is(':checked'),
        day5: $('#weekend-day5').is(':checked'),
        day6: $('#weekend-day6').is(':checked')
    };

    $.ajax({
        url: host_name + '/weekendday',
        method: 'POST',
        data: data,
        success: function() {
            calback();
        }
    });
}


function calcMinDate() {
    var d = new Date();
    return d.getYear() + '/' + d.getMonth() + '/' + d.getDate();
}

function calcMaxDate() {
    var d = new Date();
    var nextMonth = d.getMonth() + 2;
    if( nextMonth > 12 ) {
        nextMonth = 1;
    }
    return d.getFullYear() + '/' + addZeroBeforeNumber(nextMonth) + 
            '/' + addZeroBeforeNumber(d.getDate());
}

function addZeroBeforeNumber( x ){
    if( x < 10 ) {
        return '0' + x;
    } else {
        return x.toString()
    }
}

function getAllowTimesFromStartEnd() {
    var res = [];
    $.ajax({
        async: false,
        url: host_name + '/hours-work',
        method: 'GET',
        success: function( data ) {
            if( data.start < 0 || data.start > 23 ||
                data.end < 0 || data.end > 23 ||
                data.start > data.end ) {
                console.log("Error in getAllowTimesFromStartEnd: invalid data.");
                console.log(data);
                return;
            }
            for(var i = data.start; i <= data.end; i++) {
                res.push(i + ":00");
            }
        },
        error: function( err ) {
            console.log( err );
        }
    });
    return res;
}

function updateTimeLine(  ) {

    $('.day-info-empy-title').css('display', 'inline-block');
    $('.day-info-comment-block').css('display', 'none');
    $('.day-info-list').css('display', 'none');
    var selectDate = new Date();
    var month_data;
    uploadDayData({ year: $('.xdsoft_date[data-date="1"]').data('year'), month: $('.xdsoft_date[data-date="1"]').data('month') }, function(data){
        month_data = data;

        setTimeout(function(){
            $('.xdsoft_time.xdsoft_time_close').removeClass('xdsoft_time_close');
            $('.xdsoft_time.xdsoft_current').removeClass('xdsoft_current');
            $('.xdsoft_time.hour-close').removeClass('hour-close');
            $('.xdsoft_time_variant').unbind();
            $('.xdsoft_time_variant .xdsoft_time').unbind();

            if( $('.xdsoft_time.xdsoft_current').length === 0 ) {
                $('.day-function button').not('.day-function-close-day').attr('disabled', 'disabled');
            }
            
            if( $('.xdsoft_date.xdsoft_current.day-any-plane').length > 0 ||
                $('.xdsoft_date.day-close.xdsoft_current').length > 0 ) {
                $('.day-function button.day-function-close-day').attr('disabled', 'disabled');
            } else {
                $('.day-function button.day-function-close-day').removeAttr('disabled');
            }

            
            if( $('.xdsoft_current.xdsoft_date.day-close').length > 0 ) {
                $('.day-function button.day-function-open-day').removeAttr('disabled');
            }

            if( $('.xdsoft_current.xdsoft_date').data('date') < selectDate.getDate() &&
                $('.xdsoft_current.xdsoft_date').data('month') <= selectDate.getMonth() &&
                $('.xdsoft_current.xdsoft_date').data('year') <= selectDate.getFullYear() ) {

                $('.day-function button').attr('disabled', 'disabled');
            }

            $('.xdsoft_time_variant .xdsoft_time').click(function(e){
                $('.xdsoft_time_variant .xdsoft_current').removeClass('xdsoft_current');
                $(e.target).addClass('xdsoft_current');
                showInfo(e);

                $('.day-function').removeClass('day-function-disabled');
                var t = $('.xdsoft_time_close.xdsoft_current');
                if( t.length > 0 ) {
                    $('.day-function button.day-function-cancel-enroll').removeAttr('disabled');
                    $('.day-function button.day-function-close-hour').attr('disabled', 'disabled');
                    $('.day-function button.day-function-new-enroll').attr('disabled', 'disabled');
                    $('.day-function button.day-function-open-hour').attr('disabled', 'disabled');
                }
                if( $('.xdsoft_time.xdsoft_current.hour-close').length > 0 ) {
                    $('.day-function button.day-function-close-hour').attr('disabled', 'disabled');
                    $('.day-function button.day-function-new-enroll').attr('disabled', 'disabled');
                    $('.day-function button.day-function-open-hour').removeAttr('disabled');
                    $('.day-function button.day-function-cancel-enroll').attr('disabled', 'disabled');
                }
                if( $('.xdsoft_time.xdsoft_current').not('.xdsoft_time_close').not('.hour-close').length > 0 ) {
                    $('.day-function button.day-function-close-hour').removeAttr('disabled');
                    $('.day-function button.day-function-new-enroll').removeAttr('disabled');
                    $('.day-function button.day-function-open-hour').attr('disabled', 'disabled');
                    $('.day-function button.day-function-cancel-enroll').attr('disabled', 'disabled');
                }

                if( $('.xdsoft_current.xdsoft_date').data('year') <= selectDate.getFullYear() ) {
                    if( $('.xdsoft_current.xdsoft_date').data('month') < selectDate.getMonth() ) {

                        $('.day-function button').attr('disabled', 'disabled');
                        if( $('.xdsoft_time.xdsoft_current.xdsoft_time_close').length > 0 ) {
                            $('button.day-function-calculate-price').removeAttr('disabled');
                        }
                    } else if( $('.xdsoft_current.xdsoft_date').data('month') == selectDate.getMonth() ) {
                        if( $('.xdsoft_current.xdsoft_date').data('date') <= selectDate.getDate() ) {

                            $('.day-function button').attr('disabled', 'disabled');
                            if( $('.xdsoft_time.xdsoft_current.xdsoft_time_close').length > 0 ) {
                                $('button.day-function-calculate-price').removeAttr('disabled');
                            }
                        }
                    }
                }
            });

            for( var i = 0; i < month_data.length; i++ ) {
                if( $('.xdsoft_calendar .xdsoft_current').length > 0 &&
                    month_data[i].day.toString() === $('.xdsoft_calendar .xdsoft_current').data('date').toString() &&
                    month_data[i].month.toString() === $('.xdsoft_calendar .xdsoft_current').data('month').toString() ) {
                    var h = parseInt(month_data[i].hour.slice(0, 2));
                    //convert string of "12:00" to 12
                    var elem = $('div.xdsoft_time[data-hour="' + h + '"]');
                    $(elem).addClass('xdsoft_time_close');
                    elem.attr('title', 'Ця година вже зайнята.');
                    //elem.unbind();
                }
            }

        }, 100);
    });
    setTimeout(function(){
        if( $('.xdsoft_current.xdsoft_date').not('.day-weekend').length > 0 ) {
            var data = {
                year: $('.xdsoft_date.xdsoft_current').data('year'),
                month: $('.xdsoft_date.xdsoft_current').data('month'),
                day: $('.xdsoft_date.xdsoft_current').data('date') 
            };
            $.ajax({
                url: host_name + '/get-close-hours-of-day',
                method: 'POST',
                data: data,
                success: function( res ) {
                    for(var i = 0; i < res.length; i++ ) {
                        $('.xdsoft_time[data-hour="' + res[i].hour + '"]').addClass('hour-close');
                    }
                }
            });
        }
    }, 300);
    
    
}

function uploadDayData( data, calback ) {
    $.ajax({
        url: host_name + '/enroll-list',
        method: 'POST',
        data: data,
        success: calback,
        error: function(e) {
            console.log("Error: " + e);
        }
    });
}

function showInfo( element ) {
    $('.day-info-comment-block').css('display', 'none');
    if( $('.xdsoft_time.xdsoft_current.hour-close').length > 0 ) {
        var data = {
            year: $('.xdsoft_date.xdsoft_current').data('year'),
            month: $('.xdsoft_date.xdsoft_current').data('month'),
            day: $('.xdsoft_date.xdsoft_current').data('date'),
            hour: $('.xdsoft_time.xdsoft_current').data('hour')
        };
        $.ajax({
            url: host_name + '/get-close-hours-of-day',
            method: 'POST',
            data: data,
            success: function( res ) {
                $('.day-info-empy-title').css('display', 'none');
                $('.day-info-comment-block').css('display', 'block');
                $('.day-info-comment-block p').text(res[0].comment);
            }
        });
    } else {
        var sendData = {
            month: $('.xdsoft_date.xdsoft_current').data('month'),
            day: $('.xdsoft_date.xdsoft_current').data('date'),
            hour: $(element.target).text()
        };
        $.ajax({
            url: host_name + '/get-enroll',
            method: 'POST',
            data: sendData,
            success: function( res ){
                if( res.length > 0 ) {
                    $('.day-info-empy-title').css('display', 'none');
                    $('.day-info-list').css('display', 'block');

                    $('.day-info-name span').text( res[0].name ); 
                    $('.day-info-surname span').text( res[0].surname ); 
                    $('.day-info-email span').text( res[0].email );

                    if( res[0].price == undefined ) {
                        $('.day-info-price span').text( "не обраховано" );
                    } else {
                        $('.day-info-price span').text( res[0].price + " грн." );
                    }
                    if( res[0].phone !== null ) {
                        $('.day-info-phone').css('display', 'block');
                        $('.day-info-phone span').text( res[0].phone );
                    } else {
                        $('.day-info-phone').css('display', 'none');
                    }

                    if( res[0].comment ) {
                        $('.day-info-comment span').text( res[0].comment );
                    } else {
                        $('.day-info-comment').css('display', 'none');
                    }
                } else {
                    $('.day-info-empy-title').css('display', 'inline-block');
                    $('.day-info-list').css('display', 'none');
                }
            }
        });
    }
    
}

function updateHandlerDates() {
    var weekendDay;
    $.ajax({//weekday option
        url: host_name + '/weekendday',
        method: 'GET',
        success: function( data ) {
            var queryWeekend = '';
            for(var i in data) {
                if( /day[0-6]/.test(i) ) {
                    if( data[i] === true ) {
                        queryWeekend += '.xdsoft_day_of_week' + i.slice(-1) + ',';
                    }
                }
            }
            if( queryWeekend ) {
                weekendDay = queryWeekend.slice(0, -1);
                // Удалить последний символ(,)
                var weekend = $( weekendDay );
                //$('.xdsoft_day_of_week6,.xdsoft_day_of_week0');
                weekend.addClass('day-weekend');
                weekend.addClass('xdsoft_disabled');
                //weekend.addClass('xdsoft_weekend');
                weekend.unbind();
            }
        }
    });

    $.ajax({
        url: host_name + '/get-close-days',
        method: 'GET',
        success: function( data ) {
            for( var i = 0; i < data.length; i++ ) {
                $('.xdsoft_date[data-year="' + data[i].year + '"][data-month="' + 
                    data[i].month + '"][data-date="' + data[i].day + '"]').addClass('day-close');
            }
        }
    });

    //$('.xdsoft_date.xdsoft_current').removeClass('xdsoft_current');

    uploadDayData({ 
        year: $('.xdsoft_date[data-date="1"]').data('year'), 
        month: $('.xdsoft_date[data-date="1"]').data('month') }, function( res  ) {
        for(var i = 0; i < res.length; i++ ) {
            $('.xdsoft_date[data-date="' + res[i].day + '"][data-month="' + res[i].month + '"]').not('.xdsoft_disabled').addClass('day-any-plane');
        }
    });

    $.ajax({
        url: host_name + '/get-close-hours-of-month',
        method: 'POST',
        data: {
            month: $('.xdsoft_date[data-date="1"]').data('month')
        },
        success: function( res ) {
            for( var i = 0; i < res.length; i++ ) {
                $('.xdsoft_date[data-year="' + res[i].year + 
                    '"][data-month="' + res[i].month + '"][data-date="' + res[i].day + '"]').addClass('day-any-plane');
            }
            
        }
    });
    var data_elem = $('.xdsoft_date').not('.xdsoft_disabled').not( weekendDay );
    data_elem.click(function( e ) {
        $('td.xdsoft_date.xdsoft_current').removeClass('xdsoft_current');
        // Нужно потому что клик срабатывает как на дочерном елементе так и
        // на главном
        if( e.target.toString() === "[object HTMLDivElement]" ) {
            $(e.target).parent().addClass('xdsoft_current');
        } else {
            $(e.target).addClass('xdsoft_current');
        }
        updateTimeLine();
    });

    var disabled_elem = $( weekendDay );
    disabled_elem.css('opacity', '0.3');
    disabled_elem.css('li_list', 'default');
    $(disabled_elem).mouseleave(function(){
        $(this).css('opacity', '0.3');
        $(this).css('background', '#f5f5f5');
        $(this).css('color', '#666');
    });
    disabled_elem.mousemove(function(){
        $(this).css('opacity', '0.4');
        $(this).css('background', '#f5f5f5');
        $(this).css('color', '#666');
    });
    
}

function elt( name, attributes ) {
    var node = document.createElement( name );
    if ( attributes ) {
        for ( var attr in attributes ){
            if ( attributes.hasOwnProperty( attr ) ) {
                if( attr === "inside" ) {
                    node.innerHTML = attributes[ attr ];
                } else{
                    node.setAttribute( attr, attributes[ attr ] );
                }
            }
        }
    }
    for ( var i = 2; i < arguments.length; i++ ) {
        var child = arguments[ i ];
        if ( typeof child === "string" ){
            child = document.createElement( child );
        }
        node.appendChild( child );
    }
    return node;
}