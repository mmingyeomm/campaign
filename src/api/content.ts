import axios from 'axios';
import { CONFIG } from './config';

// Content type definition
export interface Content {
  id: number;
  content: string;
  imageURL?: string;
  walletAddress: string;
  senderId: string;
  communityId: string;
  createdAt: string;
}

// Content API service
export const ContentAPI = {
  // Fetch all contents from API (수정되지 않음)
  async fetchAllContents(communityId?: string): Promise<Content[]> {
    try {
      const timestamp = new Date().getTime();
      let url;
      
      if (communityId) {
        url = `${CONFIG.api.base}/api/communities/${communityId}/contents?t=${timestamp}`;
      } else {
        url = `${CONFIG.api.content()}?t=${timestamp}`;
      }
      
      console.log("Fetching content from URL:", url);
      const response = await axios.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch content:', error);
      return [];
    }
  },

  // Format date string (수정되지 않음)
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString();
  },

  // Format wallet address (수정되지 않음)
  formatWalletAddress(address: string): string {
    if (!address) return 'Unknown';
    if (address.length <= 10) return address;
    
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  },

  // Submit new content
  async submitContent(text: string, communityId: string, imageUrl?: string, walletAddress?: string): Promise<any> {
    const requestData = {
      content: text,
      senderId: CONFIG.fixed.senderId,
      communityId: communityId,
      imageURL: imageUrl || null,
      walletAddress: walletAddress || CONFIG.fixed.walletAddress
    };
    
    console.log('Sending data to API:', requestData);
    
    try {
      // 1. 기존 DB에 데이터를 전송하는 로직 (그대로 유지)
      const response = await axios.post(CONFIG.api.content(), requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // ================================================================
      // <<< 여기에 구글 스프레드시트 연동 로직을 추가합니다 >>>
      // ================================================================
      try {
        // 2. 구글 앱 스크립트 URL (반드시 본인의 URL로 교체해야 합니다)
        const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbz4pXhaxHurBc6LLM2yeqUruokOzeLhWPToPRDdsg4hbapnb0yOj6Sp3WH-QZ3f4hfbBw/exec';

        // 3. 스프레드시트에 보낼 데이터 객체 생성 (sol_address와 wish만 포함)
        const sheetData = {
          sol_address: requestData.walletAddress, // walletAddress를 sol_address로 매핑
          wish: requestData.content              // content를 wish로 매핑
        };

        // 4. 데이터를 JSON 문자열로 변환하고 URL에 포함될 수 있도록 인코딩
        const encodedSheetData = encodeURIComponent(JSON.stringify(sheetData));
        
        // 5. 구글 앱 스크립트에 요청할 최종 URL 생성 (table=다음에 실제 시트/테이블명 기입)
        // 예시: const fullSheetUrl = `${googleScriptUrl}?action=insert&table=registrations&data=${encodedSheetData}`;
        const fullSheetUrl = `${googleScriptUrl}?action=insert&table=your_sheet_name&data=${encodedSheetData}`;

        // 6. Axios를 사용해 GET 요청 전송 (이 작업이 실패해도 메인 로직에 영향 없음)
        axios.get(fullSheetUrl)
          .then(sheetResponse => {
            console.log('Successfully sent data to Google Sheet:', sheetResponse.data);
          })
          .catch(sheetError => {
            // 스프레드시트 전송 실패는 콘솔에 에러만 기록
            console.error('Failed to send data to Google Sheet:', sheetError);
          });

      } catch (sheetIntegrationError) {
        console.error('An error occurred during Google Sheet integration:', sheetIntegrationError);
      }
      // ================================================================
      // <<< 연동 로직 끝 >>>
      // ================================================================

      // 7. 기존 로직의 결과값을 그대로 반환
      return response.data;

    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};
