document.querySelectorAll('.answer').forEach(button => {
    button.addEventListener('click', function() {
        // Lấy số điểm của đáp án từ thuộc tính data-points
        const points = parseInt(this.getAttribute('data-points'), 10);
        const question = this.getAttribute('data-question');

        // Ghi lại điểm của câu hỏi
        answers[question] = points;

        // Disable tất cả các nút trong câu hỏi sau khi chọn
        const buttons = document.querySelectorAll(`[data-question="${question}"]`);
        buttons.forEach(button => {
            button.disabled = true;
        });
    });
});

// Lắng nghe sự kiện khi người dùng bấm nút "Hoàn thành"
document.getElementById('submitBtn').addEventListener('click', function() {
    // Tính tổng điểm từ các đáp án đã chọn
    score = Object.values(answers).reduce((total, current) => total + current, 0);

    // Hiển thị điểm
    document.getElementById('result').innerText = `Điểm của bạn: ${score}`;
});