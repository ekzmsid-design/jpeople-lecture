document.addEventListener('DOMContentLoaded', () => {
    const personForm = document.getElementById('person-form');
    const peopleList = document.getElementById('people-list');
    const formContainer = document.getElementById('form-container');
    const showFormBtn = document.getElementById('show-form-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // 로컬 스토리지에서 데이터 불러오기
    let people = JSON.parse(localStorage.getItem('people')) || [];

    // 모달 제어 함수
    function toggleModal() {
        formContainer.classList.toggle('hidden');
        if (!formContainer.classList.contains('hidden')) {
            document.getElementById('name').focus();
        }
    }

    // 화면에 목록 렌더링하는 함수
    function renderPeople() {
        peopleList.innerHTML = '';
        people.forEach((person, index) => {
            const card = document.createElement('div');
            card.className = 'person-card';
            card.innerHTML = `
                <button class="delete-btn" onclick="deletePerson(${index})">×</button>
                <h3>${person.name}</h3>
                <p><strong>🗓️ 생일:</strong> ${person.birthday || '미입력'}</p>
                <p><strong>🏢 소속:</strong> ${person.affiliation || '미입력'}</p>
                <div class="memo-text">${person.memo || '메모가 없습니다.'}</div>
            `;
            peopleList.appendChild(card);
        });
    }

    // 이벤트 리스너
    showFormBtn.addEventListener('click', toggleModal);
    cancelBtn.addEventListener('click', () => {
        personForm.reset();
        toggleModal();
    });

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
        toggleModal(); // 저장 후 폼 닫기
    });

    // 데이터 삭제 함수
    window.deletePerson = (index) => {
        if (confirm('이 정보를 삭제하시겠습니까?')) {
            people.splice(index, 1);
            localStorage.setItem('people', JSON.stringify(people));
            renderPeople();
        }
    };

    // 초기 렌더링
    renderPeople();
});
