export default (timeString) => {
    const time = new Date(timeString);
    const currentTime = new Date();

    const year = time.getFullYear();
    const mounth = time.toLocaleDateString("en-US", { month: "long" });
    const day = time.getDate();

    if (currentTime.getFullYear() === year && currentTime.getMonth() === time.getMonth() && currentTime.getDate() === day) {
        return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (yesterday.getFullYear() === year && yesterday.getMonth() === time.getMonth() && yesterday.getDate() === day) {
        return "Yesterday";
    }

    if(currentTime.getFullYear() === year){
        return `${day} ${mounth}`;
    }
    else{
        return `${day} ${mounth} ${year}`;
    }
}