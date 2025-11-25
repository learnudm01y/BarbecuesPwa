// Advanced Search Engine with Arabic Normalization
let personsData = [];
let normalizedIndex = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});

// Load JSON data
async function loadData() {
    try {
        const response = await fetch('persons.json');
        personsData = await response.json();
        
        // Build normalized index
        buildNormalizedIndex();
        
        // Update stats
        document.getElementById('totalRecords').textContent = personsData.length.toLocaleString('ar-EG');
        
        console.log(`Loaded ${personsData.length} records`);
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('results').innerHTML = 
            '<div class="no-results">خطأ في تحميل البيانات</div>';
    }
}

// Build normalized search index
function buildNormalizedIndex() {
    normalizedIndex = personsData.map((person, index) => {
        return {
            index: index,
            normalizedFullName: normalizeArabic(person.full_name),
            normalizedFirstName: normalizeArabic(person.first_name),
            normalizedFatherName: normalizeArabic(person.father_name),
            normalizedGrandfatherName: normalizeArabic(person.grandfather_name),
            normalizedFamilyName: normalizeArabic(person.family_name),
            ciIdNum: person.ci_id_num.toString(),
            id: person.id.toString()
        };
    });
}

// Arabic Text Normalization
function normalizeArabic(text) {
    if (!text) return '';
    
    return text
        // Remove diacritics (tashkeel)
        .replace(/[\u064B-\u065F\u0670]/g, '')
        // Normalize Alef variations
        .replace(/[إأآا]/g, 'ا')
        // Normalize Ya variations
        .replace(/[ىي]/g, 'ي')
        // Normalize Ta Marbuta
        .replace(/ة/g, 'ه')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// Main search function
function search() {
    const startTime = performance.now();
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query || query.length < 1) {
        document.getElementById('results').innerHTML = 
            '<div class="no-results">الرجاء إدخال نص للبحث</div>';
        return;
    }
    
    // Check if query is a number (ID search)
    const isNumericSearch = /^\d+$/.test(query);
    
    let results;
    if (isNumericSearch) {
        results = searchById(query);
    } else {
        results = searchByName(query);
    }
    
    const endTime = performance.now();
    const searchTime = (endTime - startTime).toFixed(2);
    
    // Update stats
    document.getElementById('foundRecords').textContent = results.length.toLocaleString('ar-EG');
    document.getElementById('searchTime').textContent = searchTime;
    
    // Display results
    displayResults(results, query);
}

// Search by ID (ci_id_num or id)
function searchById(query) {
    return normalizedIndex
        .filter(item => 
            item.ciIdNum.includes(query) || 
            item.id.includes(query)
        )
        .map(item => personsData[item.index])
        .slice(0, 100); // Limit to 100 results
}

// Search by name (supports full, triple, double names)
function searchByName(query) {
    const normalizedQuery = normalizeArabic(query);
    const queryParts = normalizedQuery.split(/\s+/).filter(p => p.length > 0);
    
    if (queryParts.length === 0) return [];
    
    const results = [];
    const scores = [];
    
    for (let i = 0; i < normalizedIndex.length; i++) {
        const item = normalizedIndex[i];
        let score = 0;
        let matchFound = false;
        
        // Full name match (highest priority)
        if (item.normalizedFullName.includes(normalizedQuery)) {
            score += 100;
            matchFound = true;
        }
        
        // Check if all query parts exist in full name
        const allPartsMatch = queryParts.every(part => 
            item.normalizedFullName.includes(part)
        );
        
        if (allPartsMatch) {
            score += 80;
            matchFound = true;
        }
        
        // Individual name parts matching
        queryParts.forEach(part => {
            if (item.normalizedFirstName.includes(part)) {
                score += 20;
                matchFound = true;
            }
            if (item.normalizedFatherName.includes(part)) {
                score += 15;
                matchFound = true;
            }
            if (item.normalizedGrandfatherName.includes(part)) {
                score += 10;
                matchFound = true;
            }
            if (item.normalizedFamilyName.includes(part)) {
                score += 25;
                matchFound = true;
            }
        });
        
        // Sequential name matching (for double, triple names)
        if (queryParts.length >= 2) {
            const nameParts = [
                item.normalizedFirstName,
                item.normalizedFatherName,
                item.normalizedGrandfatherName,
                item.normalizedFamilyName
            ];
            
            // Check consecutive matches
            for (let j = 0; j <= nameParts.length - queryParts.length; j++) {
                const consecutiveMatch = queryParts.every((qPart, idx) => {
                    return nameParts[j + idx] && nameParts[j + idx].includes(qPart);
                });
                
                if (consecutiveMatch) {
                    score += 50;
                    matchFound = true;
                }
            }
        }
        
        // Exact matches bonus
        if (item.normalizedFirstName === normalizedQuery) score += 30;
        if (item.normalizedFamilyName === normalizedQuery) score += 40;
        
        if (matchFound && score > 0) {
            results.push({
                person: personsData[i],
                score: score
            });
        }
    }
    
    // Sort by score (descending) and return top 100
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, 100)
        .map(r => r.person);
}

// Display search results
function displayResults(results, query) {
    const resultsDiv = document.getElementById('results');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">لا توجد نتائج مطابقة</div>';
        return;
    }
    
    let html = '';
    
    results.forEach((person, index) => {
        html += `
            <div class="result-item">
                <div>
                    <span class="result-id">ID: ${person.id}</span>
                    <span class="result-id">رقم الهوية: ${person.ci_id_num}</span>
                </div>
                <div class="result-name">${highlightMatch(person.full_name, query)}</div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">الاسم الأول:</span> ${person.first_name}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">اسم الأب:</span> ${person.father_name}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">اسم الجد:</span> ${person.grandfather_name}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">اسم العائلة:</span> ${person.family_name}
                    </div>
                </div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// Highlight matching text
function highlightMatch(text, query) {
    if (!query || /^\d+$/.test(query)) return text;
    
    const normalizedText = normalizeArabic(text);
    const normalizedQuery = normalizeArabic(query);
    const queryParts = normalizedQuery.split(/\s+/).filter(p => p.length > 0);
    
    let result = text;
    
    // Try to highlight each part
    queryParts.forEach(part => {
        const regex = new RegExp(`(${escapeRegex(part)})`, 'gi');
        const normalizedRegex = new RegExp(
            text.split('').map((char, i) => {
                if (normalizeArabic(char) === part[i % part.length]) {
                    return char;
                }
                return char;
            }).join(''),
            'gi'
        );
        
        // Simple highlighting - find approximate matches
        const words = text.split(' ');
        words.forEach((word, idx) => {
            if (normalizeArabic(word).includes(part)) {
                words[idx] = `<span class="highlight">${word}</span>`;
            }
        });
        result = words.join(' ');
    });
    
    return result;
}

// Escape special regex characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export search function globally
window.search = search;