package com.pam.mobile

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class PAMApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}