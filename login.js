class LoginSystem {
    constructor() {
        this.users = {
            atendente: { username: 'atendente', password: 'atendente123', type: 'atendente', name: 'Atendente' },
            triagem: { username: 'triagem', password: 'triagem123', type: 'triagem', name: 'Profissional de Triagem' },
            medico: { username: 'medico', password: 'medico123', type: 'medico', name: 'Médico' },
            admin: { username: 'admin', password: 'admin123', type: 'admin', name: 'Administrador' }
        }
        
        this.currentUser = null
        this.initEventListeners()
        this.checkRememberedUser()
    }

    initEventListeners() {
        // Form de login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault()
            this.handleLogin()
        })

        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', () => {
            this.togglePasswordVisibility()
        })
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password')
        const toggleBtn = document.getElementById('togglePassword')
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text'
            toggleBtn.textContent = 'Ocultar'
        } else {
            passwordInput.type = 'password'
            toggleBtn.textContent = 'Mostrar'
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim()
        const password = document.getElementById('password').value
        const userType = document.getElementById('userType').value
        const rememberMe = document.getElementById('rememberMe').checked

        // Validações
        if (!username || !password || !userType) {
            this.showError('Por favor, preencha todos os campos obrigatórios.')
            return
        }

        // Simular loading
        this.setLoadingState(true)

        // Simular delay de autenticação
        setTimeout(() => {
            const user = this.authenticateUser(username, password, userType)
            
            if (user) {
                this.loginSuccess(user, rememberMe)
            } else {
                this.showError('Usuário, senha ou tipo de usuário incorretos.')
                this.setLoadingState(false)
            }
        }, 1500)
    }

    authenticateUser(username, password, userType) {
        // Verificar se o usuário existe
        const user = Object.values(this.users).find(u => 
            u.username === username && 
            u.password === password && 
            u.type === userType
        )

        return user || null
    }

    loginSuccess(user, rememberMe) {
        this.currentUser = user
        
        // Salvar dados do usuário
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({
                username: user.username,
                userType: user.type
            }))
        } else {
            localStorage.removeItem('rememberedUser')
        }

        // Salvar sessão atual
        sessionStorage.setItem('currentUser', JSON.stringify(user))
        sessionStorage.setItem('loginTime', new Date().toISOString())

        // Redirecionar para o sistema principal
        this.redirectToMainSystem()
    }

    redirectToMainSystem() {
        // Adicionar parâmetros de usuário na URL
        const params = new URLSearchParams({
            user: this.currentUser.username,
            type: this.currentUser.type,
            name: this.currentUser.name
        })

        window.location.href = `index.html?${params.toString()}`
    }

    showError(message) {
        // Remover mensagens de erro anteriores
        this.clearErrors()

        // Adicionar classe de erro aos campos
        const formGroups = document.querySelectorAll('.form-group')
        formGroups.forEach(group => {
            group.classList.add('error')
        })

        // Criar mensagem de erro
        const errorDiv = document.createElement('div')
        errorDiv.className = 'error-message'
        errorDiv.textContent = message
        errorDiv.style.textAlign = 'center'
        errorDiv.style.marginTop = '10px'
        errorDiv.style.padding = '10px'
        errorDiv.style.backgroundColor = '#fef2f2'
        errorDiv.style.border = '1px solid #fecaca'
        errorDiv.style.borderRadius = '8px'
        errorDiv.style.color = '#dc2626'

        // Inserir mensagem após o formulário
        const form = document.getElementById('loginForm')
        form.parentNode.insertBefore(errorDiv, form.nextSibling)

        // Remover erro após 5 segundos
        setTimeout(() => {
            this.clearErrors()
        }, 5000)
    }

    clearErrors() {
        // Remover classes de erro
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error')
        })

        // Remover mensagens de erro
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.remove()
        })
    }

    setLoadingState(loading) {
        const loginBtn = document.querySelector('.login-btn')
        const btnText = document.querySelector('.btn-text')
        const btnLoading = document.querySelector('.btn-loading')

        if (loading) {
            loginBtn.classList.add('loading')
            btnText.style.display = 'none'
            btnLoading.style.display = 'inline'
        } else {
            loginBtn.classList.remove('loading')
            btnText.style.display = 'inline'
            btnLoading.style.display = 'none'
        }
    }

    checkRememberedUser() {
        const remembered = localStorage.getItem('rememberedUser')
        if (remembered) {
            try {
                const userData = JSON.parse(remembered)
                document.getElementById('username').value = userData.username
                document.getElementById('userType').value = userData.userType
                document.getElementById('rememberMe').checked = true
            } catch (e) {
                console.error('Erro ao carregar usuário lembrado:', e)
            }
        }
    }
}



// Inicializar sistema de login
document.addEventListener('DOMContentLoaded', () => {
    new LoginSystem()
}) 