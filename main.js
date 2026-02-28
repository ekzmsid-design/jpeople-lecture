document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소들
    const personForm = document.getElementById('person-form');
    const groupForm = document.getElementById('group-form');
    const peopleList = document.getElementById('people-list');
    const formContainer = document.getElementById('form-container');
    const groupFormContainer = document.getElementById('group-form-container');
    const showFormBtn = document.getElementById('show-form-btn');
    const showGroupFormBtn = document.getElementById('show-group-form-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const cancelGroupBtn = document.getElementById('cancel-group-btn');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    const searchInput = document.getElementById('search-input');
    const groupTabs = document.getElementById('group-tabs');
    const personGroupSelect = document.getElementById('person-group');

    // 로컬 스토리지 데이터 불러오기
    let people = JSON.parse(localStorage.getItem('people')) || [];
    let groups = JSON.parse(localStorage.getItem('groups')) || [];
    let currentGroupId = 'all';

    // 초기화 함수
    function init() {
        renderGroupTabs();
        updateGroupSelect();
        renderPeople();
    }

    // 모달 제어 함수 (인물 추가)
    function togglePersonModal() {
        formContainer.classList.toggle('hidden');
        if (formContainer.classList.contains('hidden')) {
            personForm.reset();
            resetPhotoPreview();
        } else {
            document.getElementById('name').focus();
        }
    }

    // 모달 제어 함수 (그룹 추가)
    function toggleGroupModal() {
        groupFormContainer.classList.toggle('hidden');
        if (!groupFormContainer.classList.contains('hidden')) {
            document.getElementById('group-name').focus();
        } else {
            groupForm.reset();
        }
    }

    // 사진 프리뷰 리셋
    function resetPhotoPreview() {
        photoPreview.innerHTML = '<span>👤</span>';
    }

    // 그룹 탭 렌더링
    function renderGroupTabs() {
        const tabs = [`<button class="group-tab ${currentGroupId === 'all' ? 'active' : ''}" data-group-id="all">전체보기</button>`];
        
        groups.forEach(group => {
            tabs.push(`<button class="group-tab ${currentGroupId === group.id ? 'active' : ''}" data-group-id="${group.id}">${group.name}</button>`);
        });

        groupTabs.innerHTML = tabs.join('');

        // 탭 클릭 이벤트 연결
        document.querySelectorAll('.group-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentGroupId = tab.dataset.groupId;
                document.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderPeople();
            });
        });
    }

    // 인물 추가 폼의 그룹 선택 옵션 업데이트
    function updateGroupSelect() {
        let options = '<option value="">그룹 선택 없음</option>';
        groups.forEach(group => {
            options += `<option value="${group.id}">${group.name}</option>`;
        });
        personGroupSelect.innerHTML = options;
    }

    // 인물 목록 렌더링
    function renderPeople() {
        peopleList.innerHTML = '';
        const keyword = searchInput.value.toLowerCase();
        
        let filteredPeople = people;

        // 그룹 필터링
        if (currentGroupId !== 'all') {
            filteredPeople = filteredPeople.filter(p => p.groupId === currentGroupId);
        }

        // 검색어 필터링
        if (keyword) {
            filteredPeople = filteredPeople.filter(p => {
                const searchStr = (p.name + p.affiliation + p.memo).toLowerCase();
                return searchStr.includes(keyword);
            });
        }

        if (filteredPeople.length === 0) {
            peopleList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">등록된 인물이 없거나 결과가 없습니다.</div>`;
            return;
        }

        filteredPeople.forEach((person) => {
            const actualIndex = people.indexOf(person);
            const groupName = groups.find(g => g.id === person.groupId)?.name || '';
            
            const card = document.createElement('div');
            card.className = 'person-card';
            
            const photoHtml = person.photo 
                ? `<div class="card-img-wrapper"><img src="${person.photo}" class="card-img" alt="${person.name}"></div>`
                : `<div class="card-img-wrapper"><span style="font-size: 60px;">👤</span></div>`;

            card.innerHTML = `
                <button class="delete-btn" onclick="deletePerson(${actualIndex})">×</button>
                ${photoHtml}
                <div class="card-content">
                    ${groupName ? `<span class="card-group-tag">${groupName}</span>` : ''}
                    <h3>${person.name}</h3>
                    <p><strong>🗓️ 생일:</strong> ${person.birthday || '미입력'}</p>
                    <p><strong>🏢 소속:</strong> ${person.affiliation || '미입력'}</p>
                    <div class="memo-text">${person.memo || '메모가 없습니다.'}</div>
                </div>
            `;
            peopleList.appendChild(card);
        });
    }

    // 이벤트 리스너들
    showFormBtn.addEventListener('click', togglePersonModal);
    showGroupFormBtn.addEventListener('click', toggleGroupModal);
    cancelBtn.addEventListener('click', togglePersonModal);
    cancelGroupBtn.addEventListener('click', toggleGroupModal);

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            reader.readAsDataURL(file);
        }
    });

    searchInput.addEventListener('input', () => renderPeople());

    // 그룹 추가 처리
    groupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('group-name').value.trim();
        if (name) {
            const newGroup = {
                id: 'group_' + Date.now(),
                name: name
            };
            groups.push(newGroup);
            localStorage.setItem('groups', JSON.stringify(groups));
            renderGroupTabs();
            updateGroupSelect();
            toggleGroupModal();
        }
    });

    // 인물 추가 처리
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
            groupId: personGroupSelect.value,
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
        togglePersonModal();
    });

    // 삭제 함수 (전역)
    window.deletePerson = (index) => {
        if (confirm('이 정보를 삭제하시겠습니까?')) {
            people.splice(index, 1);
            localStorage.setItem('people', JSON.stringify(people));
            renderPeople();
        }
    };

    // 실행
    init();
});
