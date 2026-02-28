document.addEventListener('DOMContentLoaded', () => {
    const personForm = document.getElementById('person-form');
    const peopleList = document.getElementById('people-list');

    // 로컬 스토리지에서 데이터 불러오기
    let people = JSON.parse(localStorage.getItem('people')) || [];

    // 화면에 목록 렌더링하는 함수
    function renderPeople() {
        peopleList.innerHTML = '';
        people.forEach((person, index) => {
            const card = document.createElement('div');
            card.className = 'person-card';
            card.innerHTML = `
                <button class="delete-btn" onclick="deletePerson(${index})">X</button>
                <h3>${person.name}</h3>
                <p><strong>생일:</strong> ${person.birthday || '미입력'}</p>
                <p><strong>소속:</strong> ${person.affiliation || '미입력'}</p>
                <div class="memo-text">${person.memo || '메모 없음'}</div>
            `;
            peopleList.appendChild(card);
        });
    }

    // 데이터 추가 이벤트
    personForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newPerson = {
            name: document.getElementById('name').value,
            birthday: document.getElementById('birthday').value,
            affiliation: document.getElementById('affiliation').value,
            memo: document.getElementById('memo').value
        };

        people.push(newPerson);
        localStorage.setItem('people', JSON.stringify(people));
        
        renderPeople();
        personForm.reset();
    });

    // 데이터 삭제 함수 (전역 범위로 설정)
    window.deletePerson = (index) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            people.splice(index, 1);
            localStorage.setItem('people', JSON.stringify(people));
            renderPeople();
        }
    };

    // 초기 렌더링
    renderPeople();
});
