
// Very rough calculation of day/night mode
export function getDnMode() {
    // Default mode
    let dnMode = 'light';
    let today = new Date();

    // Bright time of your life
    let winterTimeMorning = 8;
    let summerTimeMorning = 6;
    // Dark time of your life
    let winterTimeEvening = 17;
    let summerTimeEvening = 21;

    // For Winter time
    if(determineDst() && today.getHours() > winterTimeMorning && today.getHours() < winterTimeEvening) {
        dnMode = 'light'
    }else if(!determineDst() && today.getHours() > summerTimeMorning && today.getHours() < summerTimeEvening) {
        dnMode = 'light'
    } else {
        dnMode = 'dark'
    }

    return dnMode;
}

function determineDst() {

    let rightNow = new Date();
    let jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
    let temp = jan1.toGMTString();
    let jan2 = new Date(temp.substring(0, temp.lastIndexOf(" ")-1));
    let std_time_offset = (jan1 - jan2) / (1000 * 60 * 60);

    let june1 = new Date(rightNow.getFullYear(), 6, 1, 0, 0, 0, 0);
    temp = june1.toGMTString();
    let june2 = new Date(temp.substring(0, temp.lastIndexOf(" ")-1));
    let daylight_time_offset = (june1 - june2) / (1000 * 60 * 60);
    return std_time_offset !== daylight_time_offset;

}