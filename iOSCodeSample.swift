import UIKit
import NVActivityIndicatorView
import Firebase

protocol SignInDisplayLogic: AnyObject {
    func showPopupErrorMessage(title: String, body: String)
    func showPopupInfoMessage(title: String, body: String)
    func toggleLoadingAnimation(_ isOn: Bool)
}

class SignInViewController: UIViewController, SignInDisplayLogic {
    
    // MARK: - Outlets
    
    @IBOutlet weak var emailTextField: UITextField!
    @IBOutlet weak var passwordTextField: UITextField!
    @IBOutlet weak var activityIndicator: NVActivityIndicatorView!
    
    @IBOutlet weak var loginButton: UIButton!
    @IBOutlet weak var signupButton: UIButton!
    @IBOutlet weak var forgotPasswordButton: UIButton!
    
    // MARK: - Properties
    
    var interactor: SignInBusinessLogic?
    var router: (NSObjectProtocol & SignInRoutingLogic & SignInDataPassing)?
    
    // MARK: - Object lifecycle
    
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    // MARK: - View lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupViewsData()
    }
    
    override func viewDidLayoutSubviews() {
        configureViewsAppearance()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        self.navigationController?.setNavigationBarHidden(true, animated: true)
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        self.navigationController?.setNavigationBarHidden(false, animated:true)
    }
    
    // MARK: - Actions
    
    @IBAction func loginAction(_ sender: Any) {
        FirebaseAnalytics.Analytics.logEvent(.iOS_singIn_login_tap)

        toggleLoadingAnimation(true)
        interactor?.signIn(email: emailTextField.text ?? "",
                           password: passwordTextField.text ?? "")
    }
    
    @IBAction func signupAction(_ sender: Any) {
        FirebaseAnalytics.Analytics.logEvent(.iOS_singIn_signUp_tap)

        performSegue(withIdentifier: "SubscriptionsScene", sender: self)
    }
    
    @IBAction func forgotPasswordAction(_ sender: Any) {
        FirebaseAnalytics.Analytics.logEvent(.iOS_singIn_forgotPassword_tap)

        performSegue(withIdentifier: "ResetPassword", sender: self)
    }
    
    @IBAction func freeAccessAction(_ sender: Any) {
        FirebaseAnalytics.Analytics.logEvent(.iOS_subscriptions_startFreeSubscription_tap)

        if !UserDefaultsStore.shared.isFreeUser,
           TokenManager.getToken() != freeUserToken,
           TokenManager.getToken() == "" {
        }
        
        UserDefaultsStore.shared.set(true, key: .isFreeUser)
        StoryboardSwitcher.showMainTabBar()
    }
    
    func toggleLoadingAnimation(_ isOn: Bool) {
        ActivityIndicator.toggleLoadingAnimation(isOn: isOn,
                                                 view: self.view,
                                                 indicator: activityIndicator)
    }
    
    func showPopupErrorMessage(title: String, body: String) {
        showTopErrorView(title: title, message: body)
    }
    
    func showPopupInfoMessage(title: String, body: String) {
        showTopInfoView(title: title, message: body)
    }
    
    // MARK: - Setup Methods
    
    private func setupViewsData() {
        emailTextField.delegate = self
        passwordTextField.delegate = self
        hideKeyboardWhenTappedAround()
    }
    
    private func configureViewsAppearance() {
        activityIndicator.backgroundColor = Colors.newBlue
        emailTextField.setLeftIcon(UIImage(named: "Email")!)
        emailTextField.addShadow(shadowRadius: 6,
                                         cornerRadius: 10,
                                         x: 0,
                                         y: 2,
                                         color: Colors.grayShadowColor,
                                         opacity: 0.2)
        passwordTextField.setLeftIcon(UIImage(named: "Password")!)
        passwordTextField.addShadow(shadowRadius: 6,
                                    cornerRadius: 10,
                                    x: 0,
                                    y: 2,
                                    color: Colors.grayShadowColor,
                                    opacity: 0.2)
        loginButton.addShadow(shadowRadius: 6,
                              cornerRadius: 10,
                              x: 0,
                              y: 2,
                              color: Colors.newBlue,
                              opacity: 0.32)
        signupButton.addShadow(shadowRadius: 8,
                               cornerRadius: 10,
                               x: 0,
                               y: 2,
                               color: Colors.grayShadowColor,
                               opacity: 0.32)
    }
}

// MARK: - TextField Delegate

extension SignInViewController: UITextFieldDelegate {
    
    func textFieldDidBeginEditing(_ textField: UITextField) {
        textField.layer.borderWidth = 1
        textField.layer.borderColor = Colors.newBlue.cgColor
    }
    
    func textFieldDidEndEditing(_ textField: UITextField) {
        textField.layer.borderWidth = 0
        textField.layer.borderColor = UIColor.clear.cgColor
    }
}

extension SignInViewController {
    
    // MARK: - Setup
    
    private func setup() {
        let viewController = self
        let interactor = SignInInteractor()
        let presenter = SignInPresenter()
        let router = SignInRouter()
        viewController.interactor = interactor
        viewController.router = router
        interactor.presenter = presenter
        presenter.viewController = viewController
        router.viewController = viewController
        router.dataStore = interactor
    }
    
    // MARK: - Routing
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if let scene = segue.identifier {
            let selector = NSSelectorFromString("routeTo\(scene)WithSegue:")
            if let router = router, router.responds(to: selector) {
                router.perform(selector, with: segue)
            }
        }
    }
}
