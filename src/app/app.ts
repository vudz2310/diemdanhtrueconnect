import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import checkinAPI from '../API/checkin';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ReactiveFormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  form: FormGroup;
  message = signal<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  isLoading = signal(false);

  constructor(
    private  formBuilder: FormBuilder,
  ) {
    // Format date: YYYY-MM-DD, time: HH:mm
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(11, 16);
    
    // Đọc token từ localStorage nếu có
    const savedToken = typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('token_checkin') || ''
      : '';
    
    this.form = this.formBuilder.group({
      token: [savedToken, Validators.required],
      enterpriseCode: ['trueretail', Validators.required],
      branchId: ['c6fc8196-b191-4a8a-93e2-672937e543d8', Validators.required],
      date: [localDate, Validators.required],
      time: [localTime, Validators.required],
      latitude: [20.993557922080083, Validators.required],
      longitude: [105.82790869268175, Validators.required],
    });
  }

  private convertDateAndTimeToISO(date: string, time: string): string {
    // Combine date (YYYY-MM-DD) và time (HH:mm) thành ISO string
    const dateTimeString = `${date}T${time}:00`;
    return new Date(dateTimeString).toISOString();
  }

  private async getLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
    if (!('geolocation' in navigator)) return undefined;
    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.message.set({ type, text });
    // Tự động ẩn thông báo sau 5 giây
    setTimeout(() => {
      this.message.set({ type: null, text: '' });
    }, 5000);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.showMessage('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.isLoading.set(true);
    this.message.set({ type: null, text: '' });

    const formValue = this.form.value;
    
    // Lưu token vào localStorage trước khi gọi API
    if (formValue.token && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token_checkin', formValue.token);
    }
    
    const timeISO = this.convertDateAndTimeToISO(formValue.date, formValue.time);
    
    const payload: any = {
      enterpriseCode: formValue.enterpriseCode,
      branchId: formValue.branchId,
      time: timeISO,
      location: {
        latitude: parseFloat(formValue.latitude),
        longitude: parseFloat(formValue.longitude),
      },
    };

    try {
      const res = await checkinAPI.post('', payload);
      console.log('Check-in success:', res.data);
      this.showMessage('success', 'Check-in thành công!');
    } catch (err: any) {
      console.error('Check-in failed:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi check-in';
      this.showMessage('error', `Lỗi: ${errorMessage}`);
    } finally {
      this.isLoading.set(false);
    }
  }
  protected readonly title = signal('diemdanh');
}
