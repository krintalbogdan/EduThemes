export const pieChartData = {
    labels: ["Happy", "Sad", "Anger", "Style", "Miscellanious"],
    datasets: [
        {
            label: "People",
            data: [120, 60, 30, 90, 45],
            backgroundColor: [
                "rgba(85, 139, 139, 0.8)",  // Unique color for Facebook
                "rgba(200, 100, 100, 0.8)", // Unique color for Instagram
                "rgba(100, 200, 150, 0.8)", // Unique color for Twitter
                "rgba(180, 80, 200, 0.8)",  // Unique color for Youtube
                "rgba(250, 180, 80, 0.8)",  // Unique color for LinkedIn
            ],
            hoverOffset: 4,
        },
    ],
};
