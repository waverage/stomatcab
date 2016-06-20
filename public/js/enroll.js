var weekendDay;
var host_name = "";

$(document).ready(initScript);

function initScript() {
    host_name = "http://" + window.location.host;
    $.datetimepicker.setLocale('ua');
    $('#datetimepicker').datetimepicker({
        inline: true,
        allowTimes: getAllowTimesFromStartEnd(),
        onSelectDate: updateTimeLine,
        onChangeMonth: function(){
            setTimeout(function(){//Задержка нужна потому что скрипт
                updateHandlerDates();//календаря не успевает обновить елементы
                updateTimeLine();
                $('.xdsoft_date.xdsoft_current').removeClass('xdsoft_current');
            }, 300);
            
        },
        formatDate: 'Y/m/d',
        yearEnd: new Date().getFullYear(),
        yearStart: new Date().getFullYear() ,
        minDate: calcMinDate(),
        maxDate: calcMaxDate(),
        scrollMonth: false
    });

    var days_elements;
    updateTimeLine();
    days_elements = $('td.xdsoft_date');

    $.ajax({
        url: 'http://localhost:3000/weekendday',
        method: 'GET',
        success: function( res ) {
            var queryWeekend = '';
            for(var i in res) {
                if( /day[0-6]/.test(i) ) {
                    if( res[i] === true ) {
                        queryWeekend += '.xdsoft_day_of_week' + i.slice(-1) + ',';
                    }
                }
            }
            if( queryWeekend ) {
                weekendDay = queryWeekend.slice(0, -1);
                // Удалить последний символ(,)
                var weekend = $( weekendDay );
                //$('.xdsoft_day_of_week6,.xdsoft_day_of_week0');
                weekend.addClass('xdsoft_disabled');
                //weekend.addClass('xdsoft_weekend');
                weekend.unbind();
            }
        }
    });
    
    $('.xdsoft_calendar').unbind();
    

    $('.enroll-form-submit').click(function(){
        var date = {
            year: $('.xdsoft_current.xdsoft_date').data('year'),
            month: $('.xdsoft_current.xdsoft_date').data('month'),
            day: $('.xdsoft_current.xdsoft_date').data('date'),
            hour: $('.xdsoft_current.xdsoft_time').text()
        };
        var postData = {
            // replace(...) заміняє всі пробіли на _
            name: $('.enroll-form input[name="user-name"]').val().replace(/\s+/g, "_"),
            surname: $('.enroll-form input[name="user-surname"]').val().replace(/\s+/g, "_"),
            email: $('.enroll-form input[name="user-email"]').val(),
            phone: $('.enroll-form input[name="user-phone"]').val(),
            comment: $('.enroll-form textarea[name="user-comment"]').val(),
            price: 0,
            year: date.year,
            month: date.month,
            day: date.day,
            hour: date.hour
        };

        if( !valideData( postData ) ) {
            console.log("postData is not valide.");
            $('.enroll-form-submit+span').css('opacity', '1');
            
            setTimeout(function(){
                $('.enroll-form-submit+span').css('opacity', '0');
            }, 4500);
            return false;
        }

        $.ajax({
            url: 'http://localhost:3000/enrolled',
            method: "POST",
            data: postData,
            success: successEnrolled
        });
        return false;
    });
    setTimeout(updateHandlerDates, 300);
    
}

function valideData( data ) {
    if( ( !data.name ||
        !data.surname  ||
        !data.year || 
        !data.month ||
        !data.day ||
        !data.hour ) ||
        $('input[type="email"].enroll-form-fields:invalid').length > 0 ||
        $('input[type="tel"].enroll-form-fields:invalid').length > 0 ||
        ( !data.email && !data.phone ) ) {
        return false;
    }

    return true;
}

function updateHandlerDates() {

    $.ajax({
        url: 'http://localhost:3000/get-close-days',
        method: 'GET',
        success: function( data ) {
            for( var i = 0; i < data.length; i++ ) {
                var dc = $('.xdsoft_date[data-year="' + data[i].year + '"][data-month="' + 
                    data[i].month + '"][data-date="' + data[i].day + '"]');
                dc.addClass('day-close');
                dc.attr('title', 'На цей день не можна записатись.');
                dc.unbind();
            }
        }
    });

    $('.xdsoft_date.xdsoft_current').removeClass('xdsoft_current');

    var data_elem = $('.xdsoft_date').not('.xdsoft_disabled').not('.day-close').not( weekendDay );

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
    disabled_elem.css('cursor', 'default');
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

function updateTimeLine(  ) {
    var selectDate = new Date();
    var month_data;
    uploadDayData({ 
        year: $('.xdsoft_date[data-date="1"]').data('year'), 
        month: $('.xdsoft_date[data-date="1"]').data('month') }, function(data){
        month_data = data;

        setTimeout(function(){
            $('.xdsoft_time.xdsoft_time_close').removeClass('xdsoft_time_close');
            $('.xdsoft_time.xdsoft_current').removeClass('xdsoft_current');
            $('.xdsoft_time_variant').unbind();
            $('.xdsoft_time_variant .xdsoft_time').click(function(e){
                $('.xdsoft_time_variant .xdsoft_current').removeClass('xdsoft_current');
                $(e.target).addClass('xdsoft_current');
            });

            for( var i = 0; i < month_data.length; i++ ) {
                if( $('.xdsoft_current.xdsoft_date').length > 0 &&
                    month_data[i].month !== $('.xdsoft_current.xdsoft_date').data('month') ) {
                    continue;
                }
                if( month_data[i].day.toString() === $('.xdsoft_calendar .xdsoft_current').data('date').toString() ) {
                    var h = parseInt(month_data[i].hour.slice(0, 2));
                    //convert string of "12:00" to 12
                    var elem = $('div.xdsoft_time[data-hour="' + h + '"]');
                    $(elem).addClass('xdsoft_time_close');
                    elem.attr('title', 'На цю годину не можна записатись');
                    elem.unbind();
                }
            }
            $.ajax({
                url: 'http://localhost:3000/get-close-hours-of-day',
                method: 'POST',
                data: {
                    year: $('.xdsoft_date.xdsoft_current').data('year'),
                    month: $('.xdsoft_date.xdsoft_current').data('month'),
                    day: $('.xdsoft_date.xdsoft_current').data('date')
                },
                success: function( res ) {
                    for( var i = 0; i < res.length; i++ ) {
                        var elem = $('div.xdsoft_time[data-hour="' + res[i].hour + '"]');
                        $(elem).addClass('xdsoft_time_close');
                        elem.attr('title', 'На цю годину не можна записатись');
                        elem.unbind();
                    }
                }
            });
        }, 100);
    });
};

function successEnrolled( res ) {
    $(location).attr('href', 'http://localhost:3000/enroll-success');
}

function uploadDayData( data, calback ) {
    $.ajax({
        url: 'http://localhost:3000/enroll-list',
        method: 'POST',
        data: data,
        success: calback,
        error: function(e) {
            console.log("Error: " + e);
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
        url: 'http://localhost:3000/hours-work',
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