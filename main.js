document.addEventListener('DOMContentLoaded', () => {
    const personForm = document.getElementById('person-form');
    const peopleList = document.getElementById('people-list');
    const formContainer = document.getElementById('form-container');
    const showFormBtn = document.getElementById('show-form-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');

    // 로컬 스토리지에서 데이터 불러오기
    let people = JSON.parse(localStorage.getItem('people')) || [];

    // 모달 제어 함수
    function toggleModal() {
        formContainer.classList.toggle('hidden');
        if (formContainer.classList.contains('hidden')) {
            personForm.reset();
            resetPhotoPreview();
        } else {
            document.getElementById('name').focus();
        }
    }

    // 사진 프리뷰 리셋
    function resetPhotoPreview() {
        photoPreview.innerHTML = '<span>👤</span>';
    }

    // 사진 선택 시 프리뷰 업데이트
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 화면에 목록 렌더링하는 함수
    function renderPeople() {
        peopleList.innerHTML = '';
        people.forEach((person, index) => {
            const card = document.createElement('div');
            card.className = 'person-card';
            
            const photoHtml = person.photo 
                ? `<div class="card-img-wrapper"><img src="${person.photo}" class="card-img" alt="${person.name}"></div>`
                : `<div class="card-img-wrapper"><span style="font-size: 60px;">👤</span></div>`;

            card.innerHTML = `
                <button class="delete-btn" onclick="deletePerson(${index})">×</button>
                ${photoHtml}
                <div class="card-content">
                    <h3>${person.name}</h3>
                    <p><strong>🗓️ 생일:</strong> ${person.birthday || '미입력'}</p>
                    <p><strong>🏢 소속:</strong> ${person.affiliation || '미입력'}</p>
                    <div class="memo-text">${person.memo || '메모가 없습니다.'}</div>
                </div>
            `;
            peopleList.appendChild(card);
        });
    }

    // 이벤트 리스너
    showFormBtn.addEventListener('click', toggleModal);
    cancelBtn.addEventListener('click', toggleModal);

    // 데이터 추가 이벤트
    personForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const photoFile = photoInput.files[0];
        let photoDataUrl = '';

        if (photoFile) {
            photoDataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(photoFile);
            });
        }

        const newPerson = {
            name: document.getElementById('name').value,
            birthday: document.getElementById('birthday').value,
            affiliation: document.getElementById('affiliation').value,
            memo: document.getElementById('memo').value,
            photo: photoDataUrl
        };

        people.push(newPerson);
        
        try {
            localStorage.setItem('people', JSON.stringify(people));
        } catch (error) {
            alert('저장 용량이 초과되었습니다. 너무 큰 사진은 피해주세요!');
            people.pop();
            return;
        }
        
        renderPeople();
        toggleModal();
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
